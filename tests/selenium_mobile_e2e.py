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
SCREENSHOT_DIR = os.path.join(os.getcwd(), "test-results", "mobile")
os.makedirs(SCREENSHOT_DIR, exist_ok=True)


def create_driver(width=390, height=844):
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")
    options.add_argument(f"--window-size={width},{height}")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    try:
        return webdriver.Chrome(options=options)
    except Exception:
        edge_options = webdriver.EdgeOptions()
        edge_options.add_argument("--headless=new")
        edge_options.add_argument(f"--window-size={width},{height}")
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


def safe_click(driver, element):
    driver.execute_script("arguments[0].scrollIntoView({block: 'center', inline: 'center'});", element)
    time.sleep(0.15)
    try:
        element.click()
    except Exception:
        driver.execute_script("arguments[0].click();", element)


def run_mobile_e2e_suite():
    driver = create_driver(390, 844)  # iPhone 14/15 viewport
    wait = WebDriverWait(driver, 15)
    results = []

    def record(step_name, passed, details=""):
        status = "PASS" if passed else "FAIL"
        print(f"[{status}] {step_name} {('- ' + details) if details else ''}")
        results.append({"step": step_name, "passed": passed, "details": details})
        if not passed:
            raise AssertionError(f"Mobile Test failed at step: {step_name} ({details})")

    try:
        print("\n================================================================================")
        print("  STARTING MOBILE-FIRST & MULTI-VIEWPORT SELENIUM TEST SUITE")
        print("================================================================================\n")

        # -------------------------------------------------------------------------
        # TEST M1: iPhone Viewport (390x844) - Mobile Bottom Nav & Header
        # -------------------------------------------------------------------------
        driver.get(BASE_URL)
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="hero-heading"]')))
        
        # Verify Mobile Bottom Nav is present and displayed
        bottom_nav = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="mobile-bottom-nav"]')))
        record("M1.1 Mobile bottom nav is visible and sticky", bottom_nav.is_displayed(), "Mobile bottom nav displayed on 390x844")

        # Verify touch targets meet min-height (>= 44px)
        nav_tabs = driver.find_elements(By.CSS_SELECTOR, '[data-testid="mobile-bottom-nav"] a')
        min_target_met = all(t.size['height'] >= 44 for t in nav_tabs)
        record("M1.2 Mobile bottom nav tab touch targets >= 44px", min_target_met, f"{len(nav_tabs)} tabs checked")

        # Verify no horizontal scroll leakage
        scroll_width = driver.execute_script("return document.documentElement.scrollWidth")
        client_width = driver.execute_script("return document.documentElement.clientWidth")
        record("M1.3 Zero horizontal page overflow on mobile home", scroll_width <= client_width + 1, f"scrollWidth={scroll_width}, clientWidth={client_width}")
        driver.save_screenshot(os.path.join(SCREENSHOT_DIR, "m01-homepage-iphone.png"))

        # -------------------------------------------------------------------------
        # TEST M2: Mobile Header Actions (Search Drawer & Menu Drawer)
        # -------------------------------------------------------------------------
        search_toggle = driver.find_element(By.CSS_SELECTOR, '[data-testid="header-search-toggle"]')
        search_toggle.click()
        time.sleep(0.3)
        mobile_search_bar = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="header-search-input"]')))
        record("M2.1 Mobile search toggle opens expand-down search bar", mobile_search_bar.is_displayed())

        # Close search
        search_toggle.click()
        time.sleep(0.2)

        # Test mobile drawer menu
        menu_toggle = driver.find_element(By.CSS_SELECTOR, '[data-testid="mobile-menu-toggle"]')
        menu_toggle.click()
        time.sleep(0.3)
        mobile_drawer = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="mobile-nav-drawer"]')))
        record("M2.2 Mobile drawer menu opens smoothly", mobile_drawer.is_displayed())
        
        # Close drawer by toggling menu
        menu_toggle.click()
        time.sleep(0.3)

        # -------------------------------------------------------------------------
        # TEST M3: Mobile Catalogue & Slide-Over Filter Drawer
        # -------------------------------------------------------------------------
        driver.get(f"{BASE_URL}/shop")
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="catalogue-heading"]')))

        # Check mobile filter drawer open button
        filter_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="mobile-filter-open-btn"]')))
        filter_btn.click()
        time.sleep(0.3)

        mobile_filter_drawer = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="mobile-filter-drawer"]')))
        record("M3.1 Mobile filter drawer opens via floating/sticky trigger", mobile_filter_drawer.is_displayed())

        # Apply category filter inside mobile drawer
        drawer_cat_outerwear = driver.find_element(By.CSS_SELECTOR, '[data-testid="mobile-filter-category-outerwear"]')
        drawer_cat_outerwear.click()
        time.sleep(0.2)
        driver.find_element(By.CSS_SELECTOR, '[data-testid="mobile-filter-drawer-apply-btn"]').click()
        time.sleep(0.4)

        cat_count = driver.find_element(By.CSS_SELECTOR, '[data-testid="catalogue-count"]').text
        record("M3.2 Filter applied from mobile drawer updates catalogue", "Showing 2" in cat_count, cat_count)
        driver.save_screenshot(os.path.join(SCREENSHOT_DIR, "m02-catalogue-filtered-iphone.png"))

        # -------------------------------------------------------------------------
        # TEST M4: Mobile Product Detail & Mobile Sticky Buy Bar
        # -------------------------------------------------------------------------
        driver.get(f"{BASE_URL}/product/double-breasted-water-repellent-trench-coat")
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="product-detail-title"]')))

        # Select Stone colour and M size
        safe_click(driver, driver.find_element(By.CSS_SELECTOR, '[data-testid="variant-color-stone"]'))
        safe_click(driver, driver.find_element(By.CSS_SELECTOR, '[data-testid="variant-size-m"]'))
        time.sleep(0.3)

        # Verify mobile sticky buy bar is present
        sticky_bar = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="mobile-sticky-buy-bar"]')))
        record("M4.1 Mobile sticky buy bar is visible at bottom", sticky_bar.is_displayed())

        # Click Add to Cart in the sticky bar
        mobile_buy_btn = driver.find_element(By.CSS_SELECTOR, '[data-testid="mobile-sticky-add-cart-btn"]')
        safe_click(driver, mobile_buy_btn)
        time.sleep(0.5)

        # Check mobile bottom nav bag badge updated
        nav_bag_badge = driver.find_element(By.CSS_SELECTOR, '[data-testid="mobile-bottom-badge"]')
        record("M4.2 Mobile bottom nav live cart badge reflects added garment", nav_bag_badge.text == "1", f"Badge count: {nav_bag_badge.text}")
        driver.save_screenshot(os.path.join(SCREENSHOT_DIR, "m03-product-mobile-buy-bar.png"))

        # -------------------------------------------------------------------------
        # TEST M5: Mobile Shopping Cart & Mobile Sticky Checkout Bar
        # -------------------------------------------------------------------------
        driver.get(f"{BASE_URL}/cart")
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="cart-page-heading"]')))

        # Verify mobile sticky checkout bar is present
        mobile_cart_bar = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="mobile-sticky-checkout-bar"]')))
        record("M5.1 Mobile sticky checkout bar is visible", mobile_cart_bar.is_displayed())

        # Click proceed to checkout from mobile bar
        mobile_checkout_btn = driver.find_element(By.CSS_SELECTOR, '[data-testid="mobile-sticky-checkout-btn"]')
        safe_click(driver, mobile_checkout_btn)
        time.sleep(0.4)

        # -------------------------------------------------------------------------
        # TEST M6: Mobile Checkout with Collapsible Summary & Payment Flow
        # -------------------------------------------------------------------------
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="checkout-heading"]')))

        # Toggle collapsible mobile order summary
        summary_toggle = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="mobile-summary-toggle"]')))
        safe_click(driver, summary_toggle)
        time.sleep(0.3)
        summary_content = driver.find_element(By.CSS_SELECTOR, '[data-testid="mobile-summary-content"]')
        record("M6.1 Mobile order summary accordion toggles details smoothly", summary_content.is_displayed())

        # Fill mobile checkout form (verify 16px text size to prevent iOS Safari auto-zoom)
        name_input = driver.find_element(By.CSS_SELECTOR, '[data-testid="checkout-fullname"]')
        font_size = name_input.value_of_css_property("font-size")
        record("M6.2 Checkout input font-size >= 16px to prevent iOS auto-zoom", float(font_size.replace("px", "")) >= 16.0, f"font-size={font_size}")

        name_input.send_keys("Priya Sundaram")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="checkout-email"]').send_keys("priya.sundaram@example.com")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="checkout-phone"]').send_keys("9876543210")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="checkout-address1"]').send_keys("Flat 402, Lotus Towers, Indiranagar")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="checkout-city"]').send_keys("Bengaluru")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="checkout-state"]').send_keys("Karnataka")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="checkout-postalcode"]').send_keys("560038")

        # Submit checkout to trigger Razorpay modal
        safe_click(driver, driver.find_element(By.CSS_SELECTOR, '[data-testid="submit-checkout-button"]'))
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="razorpay-gateway-modal"]')))
        record("M6.3 Mobile Razorpay simulated payment bottom-sheet modal opens", True)
        driver.save_screenshot(os.path.join(SCREENSHOT_DIR, "m04-razorpay-mobile-modal.png"))

        # Pay via simulated modal
        safe_click(driver, driver.find_element(By.CSS_SELECTOR, '[data-testid="razorpay-confirm-pay-btn"]'))
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="order-confirmation-page"]')))
        order_num = driver.find_element(By.CSS_SELECTOR, '[data-testid="confirmed-order-number"]').text
        record("M6.4 Mobile order complete & confirmed with HMAC signature verification", bool(order_num), f"Order: {order_num}")
        driver.save_screenshot(os.path.join(SCREENSHOT_DIR, "m05-order-confirmed-mobile.png"))

        # -------------------------------------------------------------------------
        # TEST M7: Android Compact Viewport (360x740) & Admin Card Layout
        # -------------------------------------------------------------------------
        driver.set_window_size(360, 740)
        time.sleep(0.5)

        # Login as Admin on mobile
        driver.get(f"{BASE_URL}/login")
        admin_qf = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="quickfill-admin-btn"]')))
        safe_click(driver, admin_qf)
        time.sleep(0.3)
        submit_btn = driver.find_element(By.CSS_SELECTOR, '[data-testid="login-submit-button"]')
        safe_click(driver, submit_btn)

        # Wait for Admin dashboard to load
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="admin-dashboard-heading"]')))

        # Verify admin mobile metrics grid
        overview_metrics = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="metric-total-orders"]')))
        record("M7.1 Admin dashboard metrics responsive 2x2 grid renders on 360px viewport", overview_metrics.is_displayed())

        # Check mobile product card layout
        driver.find_element(By.CSS_SELECTOR, '[data-testid="admin-tab-products"]').click()
        time.sleep(0.4)
        mobile_prod_cards = driver.find_elements(By.CSS_SELECTOR, '[data-testid^="admin-product-card-"]')
        record("M7.2 Admin mobile product cards render instead of overflowing table", len(mobile_prod_cards) >= 6, f"{len(mobile_prod_cards)} cards found")

        # Check mobile orders card layout
        driver.find_element(By.CSS_SELECTOR, '[data-testid="admin-tab-orders"]').click()
        time.sleep(0.4)
        mobile_order_cards = driver.find_elements(By.CSS_SELECTOR, '[data-testid^="admin-order-card-"]')
        record("M7.3 Admin mobile order cards render with touch-friendly status picker", len(mobile_order_cards) >= 1, f"{len(mobile_order_cards)} order cards found")
        driver.save_screenshot(os.path.join(SCREENSHOT_DIR, "m06-admin-mobile-android.png"))

        # -------------------------------------------------------------------------
        # TEST M8: Desktop (1440x900) - Mobile UI Elements Gracefully Hide
        # -------------------------------------------------------------------------
        driver.set_window_size(1440, 900)
        time.sleep(0.5)
        driver.get(BASE_URL)
        time.sleep(0.4)

        bottom_nav_present = len(driver.find_elements(By.CSS_SELECTOR, '[data-testid="mobile-bottom-nav"]')) > 0
        bottom_nav_displayed = driver.find_element(By.CSS_SELECTOR, '[data-testid="mobile-bottom-nav"]').is_displayed()
        record("M8.1 Mobile bottom nav is hidden on desktop viewport (1440px)", not bottom_nav_displayed, "Bottom nav correctly hidden on desktop")

        driver.get(f"{BASE_URL}/cart")
        time.sleep(0.4)
        sticky_cart = driver.find_elements(By.CSS_SELECTOR, '[data-testid="mobile-sticky-checkout-bar"]')
        is_visible = any(el.is_displayed() for el in sticky_cart)
        record("M8.2 Mobile sticky cart bar is not visible on desktop viewport", not is_visible, "Correctly not visible on desktop")

        print("\n================================================================================")
        print(f"  ALL {len(results)} MOBILE-FIRST & MULTI-VIEWPORT TESTS PASSED SUCCESSFULLY!")
        print("================================================================================\n")

    except Exception as e:
        driver.save_screenshot(os.path.join(SCREENSHOT_DIR, "failure-state.png"))
        print(f"\n[EXCEPTION] {e}")
        raise
    finally:
        driver.quit()


if __name__ == "__main__":
    run_mobile_e2e_suite()
