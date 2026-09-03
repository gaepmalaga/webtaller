#!/usr/bin/env python3
"""
Genera `hidrocar-una-sola-pagina.html`: la web entera en un único archivo,
con la tipografía, los estilos y el JavaScript metidos dentro.

Para qué sirve: poder enseñar la web sin depender de ningún alojamiento.
Se abre con doble clic, funciona sin internet, se manda por WhatsApp o por
correo, y se puede arrastrar a Netlify Drop para tener una dirección en
treinta segundos.

    python3 herramientas/construir-archivo-unico.py
"""
import base64
import pathlib
import re

RAIZ = pathlib.Path(__file__).resolve().parent.parent
SALIDA = RAIZ / 'hidrocar-una-sola-pagina.html'


def leer(rel):
    return (RAIZ / rel).read_text(encoding='utf-8')


def datauri(rel, mime):
    b = (RAIZ / rel).read_bytes()
    return 'data:%s;base64,%s' % (mime, base64.b64encode(b).decode('ascii'))


def main():
    html = leer('index.html')
    css = leer('assets/css/style.css')
    js = leer('assets/js/main.js')

    # La tipografía entra como data URI. Solo el subconjunto «latin»:
    # latin-ext no hace falta para escribir en español y pesa otros 84 KB.
    fuente = datauri('assets/fonts/archivo-latin.woff2', 'font/woff2')
    css = css.replace("url('../fonts/archivo-latin.woff2')", "url(%s)" % fuente)
    css = re.sub(
        r"@font-face \{[^}]*archivo-latin-ext\.woff2[^}]*\}\n?", '', css, flags=re.S)

    # Fuera el precargado y la hoja externa: los estilos van incrustados.
    html = re.sub(r'<link rel="preload"[^>]*>\n?', '', html)
    html = html.replace(
        '<link rel="stylesheet" href="assets/css/style.css">',
        '<style>\n%s\n</style>' % css)

    # El icono, también incrustado.
    html = html.replace(
        'href="assets/img/favicon.svg"',
        'href="%s"' % datauri('assets/img/favicon.svg', 'image/svg+xml'))

    # Y el script.
    html = html.replace(
        '<script src="assets/js/main.js" defer></script>',
        '<script>\n%s\n</script>' % js)

    # El aviso legal no viaja en este archivo: el enlace no llevaría a ninguna
    # parte, así que se queda como texto.
    html = html.replace(
        '<p><a href="aviso-legal.html">Aviso legal y privacidad</a></p>',
        '<p>Aviso legal y privacidad</p>')

    SALIDA.write_text(html, encoding='utf-8')
    print('%s — %.0f KB' % (SALIDA.name, SALIDA.stat().st_size / 1024))


if __name__ == '__main__':
    main()
