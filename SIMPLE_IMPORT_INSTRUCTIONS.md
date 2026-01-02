# Simple CSV Import - Direct to Deals Table

## Option 1: Import via Supabase UI (Easiest)

1. **Go to Table Editor** → Click on `deals` table
2. **Click "Insert"** → **"Import data from CSV"**
3. **Upload your CSV**
4. **Map your columns manually:**
   - `Company name` → `company_name`
   - `Asking Price` → `valuation_ask`
   - `Client` or `Team` → `analyst_owner`
   - `Company Description` → `executive_summary`
   - `Deal Stage` → `status`
   - `Industry` → `sector`
   - `MRR` → `mrr`
   - `Contact email` → `contact_email`
   - `Source` → `source`
   - `Type` → `deal_type`
   - `Due Date` → `due_date`
   - `Follow up Task` → `follow_up_task`
   - `Google Drive File` → `google_drive_url`
   - `Supporting Doc` → `supporting_doc_url`
   - `Seller's Social` → `seller_social`
   - `Competitors & Competitive Advantages:` → `competitors`
5. **Skip these columns** (they'll be auto-calculated or set to NULL):
   - `revenue` (will be calculated from MRR)
   - `id`, `user_id`, `created_at`, `updated_at` (auto-generated)
6. **Click Import**

## Option 2: Use Temp Table (One SQL Command)

1. **Create temp table:**
   - Table Editor → Create new table → Name it `temp_csv_import`
   - Import your CSV (Supabase will auto-create columns)

2. **Run `DIRECT_IMPORT_TO_DEALS.sql`** (change table name in the script)

3. **Done!** Temp table gets deleted automatically.










