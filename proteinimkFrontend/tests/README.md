# Product regression checks

Run the normal Vite dev server and open:

- /tests/product-regressions.html?view=admin
- /tests/product-regressions.html

These fixtures mount the real components under StrictMode and replace every API
method with in-memory data. Unexpected API calls fail and fetch is disabled.
They are not included in the normal production build.

## Admin search

1. Search for Alpha, edit Alpha Whey, change its name to Alpha Whey Updated, and save.
2. Confirm the search still says Alpha and only the updated product appears.
3. Search for Beta and confirm only Beta Creatine appears.
4. Search for Alpha, then change to Beta after the search begins. Alpha responses
   take two seconds; confirm the late response does not replace Beta.
5. Clear the field and confirm both products return. Repeat editing and searching.

## Package-specific nutrition

1. At 908g, confirm Chocolate, Vanilla, Wheytella, and Strawberry nutrition tabs.
2. Select Wheytella nutrition, then immediately select 2000g. Its response takes
   two seconds; confirm it never replaces the Chocolate 2000g table.
3. Confirm Wheytella and Strawberry are absent from both the nutrition tabs and
   purchase flavour selector at 2000g.
4. Select Vanilla nutrition at 2000g. This variant has no table; confirm the empty
   state instead of any 908g table.
5. Return to 908g, select Wheytella in the purchase selector, then switch to 2000g.
   Confirm the purchase and nutrition selections both become Chocolate 2000g.
6. Return to 908g. Strawberry is out of stock: confirm its nutrition is readable,
   while its purchase option is disabled.
7. Repeat the nutrition checks at a mobile viewport using the nutrition accordion.

## Variant stock with parent quantity zero

Open `/tests/product-regressions.html?view=stock`. The parent quantity and the default Chocolate 908g variant are zero, while Vanilla 908g has ten units. Confirm Vanilla is selected initially, the quantity selector is enabled, and Add to Cart is available. Chocolate remains disabled in the flavor selector.
