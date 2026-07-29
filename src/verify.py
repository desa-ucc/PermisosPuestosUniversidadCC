from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    # Use mobile viewport
    context = browser.new_context(
        viewport={'width': 375, 'height': 812},
        record_video_dir="verification/videos/",
        record_video_size={'width': 375, 'height': 812}
    )
    page = context.new_page()

    # Mock network requests to avoid hanging
    page.route("**/api/puestos", lambda route: route.fulfill(status=200, json=[]))
    page.route("**/api/colaboradores", lambda route: route.fulfill(status=200, json=[]))
    page.route("**/api/software", lambda route: route.fulfill(status=200, json=[]))
    page.route("**/api/hardware", lambda route: route.fulfill(status=200, json=[]))
    page.route("**/api/seguridad/mis-permisos", lambda route: route.fulfill(
        status=200,
        json=[{"pantallaId": "DASHBOARD", "puedeVer": True, "puedeCrear": True, "puedeEditar": True, "puedeEliminar": True}]
    ))

    # Go to login first to set origin
    page.goto("http://localhost:4200/login")
    page.evaluate("localStorage.setItem('token', 'fake-token-for-testing')")
    page.evaluate("localStorage.setItem('role', 'admin')")
    page.evaluate("localStorage.setItem('permisos', JSON.stringify([{'pantallaId': 'DASHBOARD', 'puedeVer': true}]))")

    page.goto("http://localhost:4200/dashboard")

    # Wait for dashboard
    page.wait_for_timeout(2000)
    page.screenshot(path="verification/screenshot.png")

    # Try to open the menu
    try:
        page.click('button:has(span:text("menu"))')
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/screenshot_menu.png")
    except Exception as e:
        print("Menu button not found or could not be clicked:", e)

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
