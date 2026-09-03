from playwright.sync_api import sync_playwright
import time

def run_cuj(page):
    # Mock localStorage to bypass login as per AGENTS.md
    page.goto("http://localhost:4200")
    page.evaluate("localStorage.setItem('token', 'fake-token-for-testing')")
    page.evaluate("localStorage.setItem('role', 'admin')")

    # Mock backend responses
    page.route("**/api/seguridad/mis-permisos", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='[{"pantalla":"COMPARATIVA", "crear":true, "editar":true, "eliminar":true, "ver":true}]'
    ))

    page.route("**/api/Comparativas/hardware", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='[' +
             '{"empleado":"Juan Perez","puesto":"Desarrollador","idealTipo":"Laptop","asignadoTipo":"Laptop","idealProcesador":"i7","asignadoProcesador":"i7","idealMemoria":"16","asignadoMemoria":"16","idealDiscoDuro":"512GB SSD","asignadoDiscoDuro":"1TB SSD","idealMarca":"Dell","asignadoMarca":"Dell"},' +
             '{"empleado":"Maria Lopez","puesto":"Disenadora","idealTipo":"Desktop","asignadoTipo":"Desktop","idealProcesador":"i9","asignadoProcesador":"i7","idealMemoria":"32","asignadoMemoria":"16","idealDiscoDuro":"1TB SSD","asignadoDiscoDuro":"512GB HDD","idealMarca":"HP","asignadoMarca":"Lenovo"}' +
             ']'
    ))

    page.route("**/api/Puestos", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='[{"id":1, "nombrePuesto":"Desarrollador"}, {"id":2, "nombrePuesto":"Disenadora"}]'
    ))

    # Go to comparativa page
    page.goto("http://localhost:4200/comparativa")
    page.wait_for_timeout(2000)

    # Take screenshot at the key moment
    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(2000)  # Hold final state for the video

if __name__ == "__main__":
    import os
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    os.makedirs("/home/jules/verification/videos", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
