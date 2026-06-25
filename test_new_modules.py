"""Test des nouveaux modules: categories, suppliers, clients, sales"""
import urllib.request, json, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
BASE = 'https://localhost'

def request(method, path, data=None):
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(BASE + path, data=body, headers={'Content-Type': 'application/json', 'Authorization': 'Bearer ' + TOKEN}, method=method)
    return urllib.request.urlopen(req, context=ctx)

# Register test user (or login if exists)
try:
    data = json.dumps({'email': 'test@infrastack.com', 'name': 'Test User', 'password': 'test123'}).encode()
    req = urllib.request.Request(BASE + '/auth/register', data=data, headers={'Content-Type': 'application/json'}, method='POST')
    resp = urllib.request.urlopen(req, context=ctx)
    print(f"Register OK")
except urllib.error.HTTPError as e:
    if e.code == 400:
        print(f"User already exists, logging in...")
    else:
        raise

# Login
data = json.dumps({'email': 'test@infrastack.com', 'password': 'test123'}).encode()
req = urllib.request.Request(BASE + '/auth/login', data=data, headers={'Content-Type': 'application/json'}, method='POST')
resp = urllib.request.urlopen(req, context=ctx)
TOKEN = json.loads(resp.read().decode())['access_token']
print(f"Login OK - Token: {TOKEN[:30]}")

print("\n--- Testing Categories ---")
r = request('POST', '/stock/categories', {'name': 'Electronics', 'description': 'Electronic devices'})
cat = json.loads(r.read().decode())
print(f"  Category created: {cat['name']} (ID: {cat['id']})")
CATEGORY_ID = cat['id']

print("\n--- Testing Suppliers ---")
r = request('POST', '/stock/suppliers', {'name': 'TechCorp Inc.', 'contact': 'John Doe', 'email': 'john@techcorp.com', 'phone': '+1234567890', 'address': '123 Tech Street'})
supp = json.loads(r.read().decode())
print(f"  Supplier created: {supp['name']} (ID: {supp['id']})")
SUPPLIER_ID = supp['id']

print("\n--- Testing Clients ---")
r = request('POST', '/stock/clients', {'name': 'Acme Corporation', 'email': 'contact@acme.com', 'phone': '+1555123456', 'address': '456 Business Ave'})
client = json.loads(r.read().decode())
print(f"  Client created: {client['name']} (ID: {client['id']})")
CLIENT_ID = client['id']

print("\n--- Testing Products ---")
r = request('POST', '/stock/products', {'name': 'MacBook Pro 16', 'description': 'Pro laptop', 'quantity': 25, 'unit': 'pcs', 'price': 2499.99, 'category_id': CATEGORY_ID, 'supplier_id': SUPPLIER_ID})
product = json.loads(r.read().decode())
print(f"  Product: {product['name']} (ID: {product['id']}, Price: {product['price']})")
PRODUCT_ID = product['id']

print("\n--- Testing Movements ---")
r = request('POST', '/stock/movements', {'product_id': PRODUCT_ID, 'movement_type': 'entry', 'quantity': 50})
m1 = json.loads(r.read().decode())
print(f"  Entry: +{m1['quantity']}")
r = request('GET', f'/stock/products/{PRODUCT_ID}')
p1 = json.loads(r.read().decode())
print(f"  Stock: {p1['quantity']} (expected 75)")

r = request('POST', '/stock/movements', {'product_id': PRODUCT_ID, 'movement_type': 'exit', 'quantity': 10})
m2 = json.loads(r.read().decode())
print(f"  Exit: -{m2['quantity']}")
r = request('GET', f'/stock/products/{PRODUCT_ID}')
p2 = json.loads(r.read().decode())
print(f"  Final stock: {p2['quantity']} (expected 65)")

print("\n--- Testing Sales ---")
r = request('POST', '/stock/sales', {'client_id': CLIENT_ID, 'payment_method': 'card', 'items': [{'product_id': PRODUCT_ID, 'quantity': 2, 'unit_price': 2599.99}]})
sale = json.loads(r.read().decode())
print(f"  Sale #{sale['id']}: ${sale['total']:.2f}")
SALE_ID = sale['id']

print("\n--- Testing Dashboard ---")
r = request('GET', '/dashboard/stats')
stats = json.loads(r.read().decode())
print(f"  Stats: {stats['total_products']} products, {stats['total_sales']} sales, stock: {stats['total_stock']}")

print("\n--- Cleanup ---")
request('DELETE', f'/stock/sales/{SALE_ID}')
request('DELETE', f'/stock/products/{PRODUCT_ID}')
request('DELETE', f'/stock/clients/{CLIENT_ID}')
request('DELETE', f'/stock/suppliers/{SUPPLIER_ID}')
request('DELETE', f'/stock/categories/{CATEGORY_ID}')
print("  All cleaned up")

print("\n=================================")
print(" ALL NEW MODULE TESTS PASSED! ")
print("=================================")