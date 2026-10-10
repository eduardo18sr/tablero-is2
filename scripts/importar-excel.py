# Convierte el Excel del backlog (Historias_de_Usuario_Marketplace.xlsx) en historias.js.
# Uso: python scripts/importar-excel.py "ruta/al/Excel.xlsx" historias.js
# Solo usa la biblioteca estándar de Python.
import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
      "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships"}
HOJAS_EPICAS = ["EPICA_GESTIONAR_CUENTAS", "EPICA_GESTIONAR_ESPACIOS", "EPICA_BUSQUEDA_ESPACIOS",
                "EPICA_GESTIONAR_RESERVAS", "EPICA_GESTIONAR_PAGOS", "EPICA_ADMINISTRACION"]

z = zipfile.ZipFile(sys.argv[1])
compartidos = []
if "xl/sharedStrings.xml" in z.namelist():
    raiz = ET.fromstring(z.read("xl/sharedStrings.xml"))
    compartidos = ["".join(t.text or "" for t in si.iter("{%s}t" % NS["m"])) for si in raiz.findall("m:si", NS)]
libro = ET.fromstring(z.read("xl/workbook.xml"))
rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
destino = {r.get("Id"): r.get("Target") for r in rels}


def texto_celda(c):
    v = c.find("m:v", NS)
    tipo = c.get("t")
    if tipo == "s" and v is not None:
        return compartidos[int(v.text)]
    if tipo == "inlineStr":
        return "".join(x.text or "" for x in c.iter("{%s}t" % NS["m"]))
    return v.text if v is not None else ""


def hoja(nombre):
    for sh in libro.find("m:sheets", NS):
        if sh.get("name") != nombre:
            continue
        ruta = "xl/" + destino[sh.get("{%s}id" % NS["r"])].lstrip("/").replace("xl/", "")
        filas = []
        for fila in ET.fromstring(z.read(ruta)).iter("{%s}row" % NS["m"]):
            d = {}
            for c in fila.findall("m:c", NS):
                valor = texto_celda(c)
                if valor and valor.strip():
                    d[re.match(r"[A-Z]+", c.get("r")).group()] = valor.strip()
            if d:
                filas.append(d)
        return filas
    raise SystemExit(f"No existe la hoja {nombre}")


historias, epicas = {}, {}
for nombre in HOJAS_EPICAS:
    actual, epica = None, None
    for f in hoja(nombre):
        if f.get("A") and f.get("B") and f.get("C") and f.get("A") != "N° ÉPICA":
            epicas[f["A"]] = {"nombre": f["B"], "descripcion": f["C"]}
            epica = f["A"]
        if f.get("D", "").startswith("HU-"):
            rs = f.get("H", "")
            m = re.search(r"R(\d) · Sprint (\d)", rs)
            tam = re.search(r"Tamaño (\w)", rs)
            dep = f.get("I", "—")
            actual = {
                "id": f["D"], "titulo": f["E"], "epica": epica,
                "release": int(m.group(1)), "sprint": int(m.group(2)),
                "tamano": tam.group(1) if tam else "",
                "dependeTexto": dep,
                "depende": re.findall(r"HU-\d\d", dep.split("(")[0]) if dep != "—" else [],
                "descripcion": f["F"], "criterios": [],
                "stride": [l.strip("• ").strip() for l in f.get("J", "").split("\n") if l.strip()],
            }
            historias[f["D"]] = actual
        if actual and f.get("G", "").startswith("CA"):
            actual["criterios"].append(f["G"])

plan, release = [], None
for f in hoja("PLAN_RELEASES"):
    if f.get("A", "").startswith("Release"):
        release = f["A"]
    if f.get("B", "").startswith("Sprint"):
        plan.append({"release": release, "sprint": int(f["B"].split()[1]), "objetivo": f["C"]})

descartadas = [{"que": f["A"], "decision": f["B"], "motivo": f["C"]}
               for f in hoja("DESCARTADAS_Y_SIMPLIFICADAS") if f.get("B") in ("Descartada", "Simplificada")]

datos = {"epicas": epicas, "historias": dict(sorted(historias.items())), "plan": plan, "descartadas": descartadas}
with open(sys.argv[2], "w", encoding="utf-8") as salida:
    salida.write("// Generado desde el Excel del backlog con scripts/importar-excel.py. No editar a mano.\n")
    salida.write("window.BACKLOG = " + json.dumps(datos, ensure_ascii=False, indent=1) + ";\n")
print(f"{len(historias)} historias, {len(plan)} sprints, {len(descartadas)} descartadas o simplificadas")
