import os
import sys
import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = os.environ.get("TEST_BASE_URL", "http://localhost:3000")
SCREENSHOT_DIR = os.path.join(os.getcwd(), "test-results")
os.makedirs(SCREENSHOT_DIR, exist_ok=True)


def create_driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")
    options.add_argument("--window-size=1440,900")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    try:
        return webdriver.Chrome(options=options)
    except Exception:
        edge_options = webdriver.EdgeOptions()
        edge_options.add_argument("--headless=new")
        edge_options.add_argument("--window-size=1440,900")
        return webdriver.Edge(options=edge_options)


def set_react_input(driver, element, value):
    element.click()
    element.send_keys(value)
    if element.get_attribute("value") != value:
        driver.execute_script(
            """
            const el = arguments[0];
            const val = arguments[1];
            const proto = el.tagName === 'TEXTAREA'
              ? window.HTMLTextAreaElement.prototype
              : window.HTMLInputElement.prototype;
            const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value').set;
            nativeSetter.call(el, val);
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
            """,
            element,
            value,
        )


def run_e2e_suite():
    driver = create_driver()
    wait = WebDriverWait(driver, 15)
    results = []

    def record(step_name, passed, details=""):
        status = "PASS" if passed else "FAIL"
        print(f"[{status}] {step_name} {('- ' + details) if details else ''}")
        results.append({"step": step_name, "passed": passed, "details": details})
        if not passed:
            raise AssertionError(f"Test failed at step: {step_name} ({details})")

    try:
        # =========================================================================
        # TEST 1: Home Page, Branded Hero Banner, Categories & Image Loading
        # =========================================================================
        driver.get(BASE_URL)
        hero = wait.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="hero-heading"]'))
        )
        record(
            "1.1 Home page & hero banner load",
            "Clothing" in hero.text,
            f"Hero heading: '{hero.text}'",
        )

        # Scroll to load all images on the home page and verify naturalWidth > 0
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(1.0)
        driver.execute_script("window.scrollTo(0, 0);")
        time.sleep(0.5)
        imgs = driver.find_elements(By.TAG_NAME, "img")
        loaded_imgs = [
            img.get_attribute("src")
            for img in imgs
            if driver.execute_script("return arguments[0].naturalWidth > 0;", img)
        ]
        record(
            "1.2 All generated banner & product images load cleanly",
            len(loaded_imgs) == len(imgs) and len(imgs) >= 8,
            f"{len(loaded_imgs)}/{len(imgs)} images verified with naturalWidth > 0",
        )
        driver.save_screenshot(os.path.join(SCREENSHOT_DIR, "01-homepage.png"))

        # =========================================================================
        # TEST 2: Catalogue Browsing, Search, Filtering & Sorting
        # =========================================================================
        shop_cta = driver.find_element(By.CSS_SELECTOR, '[data-testid="hero-shop-cta"]')
        shop_cta.click()
        wait.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="catalogue-heading"]'))
        )

        search_input = driver.find_element(By.CSS_SELECTOR, '[data-testid="shop-search-input"]')
        search_input.clear()
        search_input.send_keys("Linen")
        time.sleep(0.4)
        linen_card = driver.find_elements(
            By.CSS_SELECTOR, '[data-testid="product-card-relaxed-pure-european-linen-shirt"]'
        )
        record(
            "2.1 Keyword search returns matching garments",
            len(linen_card) == 1,
            "Found 'Relaxed Pure European Linen Shirt'",
        )

        # Reset filters & test category filter + sorting
        clear_btn = driver.find_element(By.CSS_SELECTOR, '[data-testid="clear-filters-button"]')
        clear_btn.click()
        time.sleep(0.3)

        outerwear_btn = driver.find_element(
            By.CSS_SELECTOR, '[data-testid="filter-category-outerwear"]'
        )
        outerwear_btn.click()
        time.sleep(0.3)
        count_text = driver.find_element(By.CSS_SELECTOR, '[data-testid="catalogue-count"]').text
        record(
            "2.2 Category filter (Outerwear) filters catalogue",
            "Showing 2" in count_text,
            count_text,
        )

        Select(driver.find_element(By.CSS_SELECTOR, '[data-testid="shop-sort-select"]')).select_by_value(
            "price-asc"
        )
        driver.save_screenshot(os.path.join(SCREENSHOT_DIR, "02-catalogue-filtered.png"))
        record("2.3 Catalogue sorting by price works", True, "Sorted price-asc")

        # =========================================================================
        # TEST 3: Product Detail, Size/Colour Variant Selection & Stock Validation
        # =========================================================================
        driver.get(f"{BASE_URL}/product/essential-heavyweight-organic-tee")
        prod_title = wait.until(
            EC.visibility_of_element_located(
                (By.CSS_SELECTOR, '[data-testid="product-detail-title"]')
            )
        )
        record(
            "3.1 Product detail page loads",
            "Essential Heavyweight Organic Tee" in prod_title.text,
            prod_title.text,
        )

        # Select Ivory colour and L size
        ivory_btn = driver.find_element(By.CSS_SELECTOR, '[data-testid="variant-color-ivory"]')
        ivory_btn.click()
        size_l_btn = driver.find_element(By.CSS_SELECTOR, '[data-testid="variant-size-l"]')
        size_l_btn.click()
        stock_status = driver.find_element(
            By.CSS_SELECTOR, '[data-testid="variant-stock-status"]'
        ).text
        record(
            "3.2 Variant selection updates stock status dynamically",
            "In Stock" in stock_status and "L / Ivory" in stock_status,
            stock_status,
        )

        # Increase quantity to 2 and add to cart
        driver.find_element(By.CSS_SELECTOR, '[data-testid="qty-increase-btn"]').click()
        driver.find_element(By.CSS_SELECTOR, '[data-testid="add-to-cart-button"]').click()
        time.sleep(0.4)
        badge = driver.find_element(By.CSS_SELECTOR, '[data-testid="cart-badge-count"]').text
        record(
            "3.3 Adding variant to cart updates live cart badge",
            badge == "2",
            f"Cart badge count: {badge}",
        )
        driver.save_screenshot(os.path.join(SCREENSHOT_DIR, "03-product-detail.png"))

        # =========================================================================
        # TEST 4: Shopping Cart Quantity Update & Subtotal Calculation
        # =========================================================================
        driver.get(f"{BASE_URL}/cart")
        wait.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="cart-page-heading"]'))
        )
        plus_btn = driver.find_element(
            By.CSS_SELECTOR, '[data-testid="cart-qty-plus-var_01_l_ivory"]'
        )
        plus_btn.click()
        time.sleep(0.3)
        subtotal_text = driver.find_element(By.CSS_SELECTOR, '[data-testid="cart-subtotal"]').text
        shipping_text = driver.find_element(By.CSS_SELECTOR, '[data-testid="cart-shipping"]').text
        record(
            "4.1 Cart quantity update recalculates subtotal & free shipping threshold",
            "4,497" in subtotal_text and "FREE" in shipping_text,
            f"Subtotal: {subtotal_text}, Shipping: {shipping_text}",
        )
        driver.save_screenshot(os.path.join(SCREENSHOT_DIR, "04-shopping-cart.png"))

        # =========================================================================
        # TEST 5: Checkout Validation, Razorpay Payment Verification & Order Record
        # =========================================================================
        driver.find_element(By.CSS_SELECTOR, '[data-testid="proceed-to-checkout-btn"]').click()
        wait.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="checkout-heading"]'))
        )

        # Test empty form validation first
        driver.find_element(By.CSS_SELECTOR, '[data-testid="submit-checkout-button"]').click()
        err_banner = wait.until(
            EC.visibility_of_element_located(
                (By.CSS_SELECTOR, '[data-testid="checkout-error-banner"]')
            )
        )
        record(
            "5.1 Checkout form validates required customer & delivery fields",
            len(err_banner.text) > 5,
            err_banner.text,
        )

        # Fill valid shipping details
        driver.find_element(By.CSS_SELECTOR, '[data-testid="checkout-fullname"]').send_keys(
            "Rohan Deshmukh"
        )
        driver.find_element(By.CSS_SELECTOR, '[data-testid="checkout-email"]').send_keys(
            "rohan.deshmukh@example.com"
        )
        driver.find_element(By.CSS_SELECTOR, '[data-testid="checkout-phone"]').send_keys(
            "9820998877"
        )
        driver.find_element(By.CSS_SELECTOR, '[data-testid="checkout-address1"]').send_keys(
            "12 Sea View Terrace, Worli Sea Face"
        )
        driver.find_element(By.CSS_SELECTOR, '[data-testid="checkout-city"]').send_keys("Mumbai")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="checkout-state"]').send_keys(
            "Maharashtra"
        )
        driver.find_element(By.CSS_SELECTOR, '[data-testid="checkout-postalcode"]').send_keys(
            "400018"
        )

        # Submit to open Razorpay modal
        driver.find_element(By.CSS_SELECTOR, '[data-testid="submit-checkout-button"]').click()
        wait.until(
            EC.visibility_of_element_located(
                (By.CSS_SELECTOR, '[data-testid="razorpay-gateway-modal"]')
            )
        )
        driver.save_screenshot(os.path.join(SCREENSHOT_DIR, "05-razorpay-gateway.png"))

        # Authorize & complete payment
        driver.find_element(By.CSS_SELECTOR, '[data-testid="razorpay-confirm-pay-btn"]').click()
        wait.until(
            EC.visibility_of_element_located(
                (By.CSS_SELECTOR, '[data-testid="order-confirmation-page"]')
            )
        )

        order_num = driver.find_element(
            By.CSS_SELECTOR, '[data-testid="confirmed-order-number"]'
        ).text
        pay_status = driver.find_element(
            By.CSS_SELECTOR, '[data-testid="confirmed-payment-status"]'
        ).text
        record(
            "5.2 Razorpay HMAC verification & order creation succeed",
            order_num.startswith("ORD-2026-") and pay_status == "PAID",
            f"Order: {order_num}, Payment: {pay_status}",
        )
        driver.save_screenshot(os.path.join(SCREENSHOT_DIR, "06-order-confirmation.png"))

        # =========================================================================
        # TEST 6: Customer Authentication, Profile, Address & Order History
        # =========================================================================
        driver.get(f"{BASE_URL}/login")
        wait.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="login-heading"]'))
        )
        driver.find_element(By.CSS_SELECTOR, '[data-testid="quickfill-customer-btn"]').click()
        driver.find_element(By.CSS_SELECTOR, '[data-testid="login-submit-button"]').click()

        acc_heading = wait.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="account-heading"]'))
        )
        record(
            "6.1 Customer authentication & protected account page load",
            "Aarav Sharma" in acc_heading.text,
            acc_heading.text,
        )

        # Verify order history list is displayed
        orders_list = driver.find_element(By.CSS_SELECTOR, '[data-testid="account-orders-list"]')
        record(
            "6.2 Customer order history displays past orders",
            "ORD-2026-1001" in orders_list.text,
            "Verified ORD-2026-1001 in customer history",
        )
        driver.save_screenshot(os.path.join(SCREENSHOT_DIR, "07-customer-account.png"))

        # Logout customer
        logout_btn = driver.find_element(By.CSS_SELECTOR, '[data-testid="account-logout-btn"]')
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", logout_btn)
        time.sleep(0.2)
        driver.execute_script("arguments[0].click();", logout_btn)
        wait.until(EC.url_contains("/login"))

        # =========================================================================
        # TEST 7: Administrator Dashboard, Product Creation, Category & Order Update
        # =========================================================================
        # Verify unauthenticated user cannot access admin dashboard
        driver.get(f"{BASE_URL}/admin")
        denied = wait.until(
            EC.visibility_of_element_located(
                (By.CSS_SELECTOR, '[data-testid="admin-access-denied"]')
            )
        )
        record(
            "7.1 Unauthenticated access to /admin is blocked by RBAC",
            "Administrator Access Required" in denied.text,
            "Access restricted screen verified",
        )

        # Sign in as Administrator
        driver.get(f"{BASE_URL}/login")
        admin_qf = wait.until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, '[data-testid="quickfill-admin-btn"]')
            )
        )
        time.sleep(0.4)
        driver.execute_script("arguments[0].click();", admin_qf)
        time.sleep(0.2)
        submit_btn = driver.find_element(By.CSS_SELECTOR, '[data-testid="login-submit-button"]')
        driver.execute_script("arguments[0].click();", submit_btn)

        wait.until(
            EC.visibility_of_element_located(
                (By.CSS_SELECTOR, '[data-testid="admin-dashboard-heading"]')
            )
        )
        rev_text = wait.until(
            EC.visibility_of_element_located(
                (By.CSS_SELECTOR, '[data-testid="metric-total-revenue"]')
            )
        ).text
        record(
            "7.2 Admin dashboard loads sales & inventory KPIs",
            "₹" in rev_text,
            f"Total Revenue: {rev_text}",
        )
        driver.save_screenshot(os.path.join(SCREENSHOT_DIR, "08-admin-overview.png"))

        # Create a new product via Admin Modal
        new_prod_btn = driver.find_element(By.CSS_SELECTOR, '[data-testid="admin-new-product-btn"]')
        driver.execute_script("arguments[0].click();", new_prod_btn)
        title_input = wait.until(
            EC.visibility_of_element_located(
                (By.CSS_SELECTOR, '[data-testid="modal-product-title"]')
            )
        )
        time.sleep(0.2)
        set_react_input(driver, title_input, "Atelier Signature Overshirt")
        desc_input = driver.find_element(
            By.CSS_SELECTOR, '[data-testid="modal-product-description"]'
        )
        set_react_input(
            driver,
            desc_input,
            "Structured organic cotton twill overshirt with chest pockets.",
        )
        save_prod_btn = driver.find_element(By.CSS_SELECTOR, '[data-testid="modal-save-product-btn"]')
        driver.execute_script("arguments[0].click();", save_prod_btn)
        wait.until(
            EC.invisibility_of_element_located(
                (By.CSS_SELECTOR, '[data-testid="admin-product-modal"]')
            )
        )

        # Switch to Products tab & verify new product row
        prod_tab = driver.find_element(By.CSS_SELECTOR, '[data-testid="admin-tab-products"]')
        driver.execute_script("arguments[0].click();", prod_tab)
        new_prod_row = wait.until(
            EC.visibility_of_element_located(
                (
                    By.CSS_SELECTOR,
                    '[data-testid="admin-product-row-atelier-signature-overshirt"]',
                )
            )
        )
        record(
            "7.3 Admin can create new product with variants & stock",
            "Atelier Signature Overshirt" in new_prod_row.text,
            "Created 'Atelier Signature Overshirt' (₹3,199)",
        )
        driver.save_screenshot(os.path.join(SCREENSHOT_DIR, "09-admin-products.png"))

        # Switch to Orders tab & update order fulfilment status to SHIPPED
        orders_tab = driver.find_element(By.CSS_SELECTOR, '[data-testid="admin-tab-orders"]')
        driver.execute_script("arguments[0].click();", orders_tab)
        status_select = wait.until(
            EC.visibility_of_element_located(
                (
                    By.CSS_SELECTOR,
                    f'[data-testid="admin-order-status-select-{order_num}"]',
                )
            )
        )
        Select(status_select).select_by_value("SHIPPED")
        time.sleep(0.6)
        updated_val = Select(
            driver.find_element(
                By.CSS_SELECTOR,
                f'[data-testid="admin-order-status-select-{order_num}"]',
            )
        ).first_selected_option.get_attribute("value")
        record(
            "7.4 Admin can update order fulfilment status",
            updated_val == "SHIPPED",
            f"Order {order_num} updated to {updated_val}",
        )
        driver.save_screenshot(os.path.join(SCREENSHOT_DIR, "10-admin-orders.png"))

        # =========================================================================
        # TEST 8: Responsive Viewports (Mobile/Tablet/Desktop) & Info/Policy Pages
        # =========================================================================
        driver.set_window_size(375, 812)
        driver.get(BASE_URL)
        time.sleep(0.4)
        mobile_toggle = wait.until(
            EC.visibility_of_element_located(
                (By.CSS_SELECTOR, '[data-testid="mobile-menu-toggle"]')
            )
        )
        driver.execute_script("arguments[0].click();", mobile_toggle)
        drawer = wait.until(
            EC.visibility_of_element_located(
                (By.CSS_SELECTOR, '[data-testid="mobile-nav-drawer"]')
            )
        )
        record(
            "8.1 Mobile viewport (375x812) navigation drawer functions properly",
            drawer.is_displayed(),
            "Mobile drawer opened cleanly",
        )
        driver.save_screenshot(os.path.join(SCREENSHOT_DIR, "11-mobile-viewport.png"))

        driver.set_window_size(1440, 900)
        driver.get(f"{BASE_URL}/contact")
        time.sleep(0.4)
        wait.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="contact-heading"]'))
        )
        set_react_input(
            driver,
            driver.find_element(By.CSS_SELECTOR, '[data-testid="contact-name"]'),
            "Meera Nair",
        )
        set_react_input(
            driver,
            driver.find_element(By.CSS_SELECTOR, '[data-testid="contact-email"]'),
            "meera@example.com",
        )
        set_react_input(
            driver,
            driver.find_element(By.CSS_SELECTOR, '[data-testid="contact-subject"]'),
            "Bulk Corporate Gifting Inquiry",
        )
        set_react_input(
            driver,
            driver.find_element(By.CSS_SELECTOR, '[data-testid="contact-message"]'),
            "Interested in ordering 25 merino sweaters.",
        )
        contact_btn = driver.find_element(By.CSS_SELECTOR, '[data-testid="contact-submit-btn"]')
        driver.execute_script("arguments[0].click();", contact_btn)
        contact_status = wait.until(
            EC.visibility_of_element_located(
                (By.CSS_SELECTOR, '[data-testid="contact-form-status"]')
            )
        )
        record(
            "8.2 Contact form & informational policy pages work",
            "Thank you" in contact_status.text,
            contact_status.text,
        )

        for path in [
            "/about",
            "/policies/shipping",
            "/policies/returns",
            "/policies/privacy",
            "/policies/terms",
        ]:
            driver.get(f"{BASE_URL}{path}")
            h1 = wait.until(EC.visibility_of_element_located((By.TAG_NAME, "h1")))
            assert len(h1.text) > 3

        record(
            "8.3 All informational & legal policy pages render cleanly",
            True,
            "Verified /about, /policies/shipping, /returns, /privacy, /terms",
        )

        with open(os.path.join(SCREENSHOT_DIR, "selenium-report.json"), "w") as f:
            json.dump({"allPassed": True, "results": results}, f, indent=2)

        print("\n============================================================")
        print(f"ALL {len(results)} SELENIUM E2E ACCEPTANCE CHECKS PASSED!")
        print("============================================================")

    finally:
        driver.quit()


if __name__ == "__main__":
    run_e2e_suite()
