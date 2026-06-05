import pdfplumber
import sys

def analyze_pdf(pdf_path):
    print(f"Analyzing {pdf_path}...")
    try:
        with pdfplumber.open(pdf_path) as pdf:
            print(f"Total pages: {len(pdf.pages)}")
            for i in range(min(2, len(pdf.pages))):
                page = pdf.pages[i]
                print(f"--- PAGE {i+1} TEXT ---")
                print(page.extract_text())
                print(f"--- PAGE {i+1} TABLES ---")
                tables = page.extract_tables()
                for j, table in enumerate(tables):
                    print(f"Table {j+1} rows: {len(table)}")
                    for row in table[:5]: # print first 5 rows
                        print(row)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    analyze_pdf('document.pdf')
