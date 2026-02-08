import pandas as pd
from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder
import io

def test_apriori_improved(csv_content, min_support=0.1, min_threshold=0.7, metric="lift", has_header=False):
    print(f"\n--- Testing: support={min_support}, threshold={min_threshold}, metric={metric}, header={has_header} ---")
    
    # Simulate the file reading logic in app.py
    df = pd.read_csv(io.StringIO(csv_content), header=0 if has_header else None)
    
    transactions = []
    values = df.values.tolist()
    for row in values:
        # Improved logic: set, sorted, stripped
        transaction = sorted(list(set([str(item).strip() for item in row if pd.notna(item) and str(item).strip() != ''])))
        if transaction:
            transactions.append(transaction)
    
    print(f"Transactions count: {len(transactions)}")
    
    te = TransactionEncoder()
    te_ary = te.fit(transactions).transform(transactions)
    encoded_df = pd.DataFrame(te_ary, columns=te.columns_)
    
    frequent_itemsets = apriori(encoded_df, min_support=min_support, use_colnames=True)
    if frequent_itemsets.empty:
        print("No frequent itemsets found.")
        return

    rules = association_rules(frequent_itemsets, metric=metric, min_threshold=min_threshold)
    if rules.empty:
        print("No rules found.")
        return

    print(f"Rules Found: {len(rules)}")
    print(rules[['antecedents', 'consequents', 'support', 'confidence', 'lift']].head())

# Sample data with header
data_with_header = """Item1,Item2,Item3
Milk,Bread,Eggs
Milk,Bread
Milk,Eggs
Bread,Eggs
Milk,Bread,Eggs"""

# Test with header=True
test_apriori_improved(data_with_header, metric="confidence", has_header=True)

# Test with header=False (should see Item1, Item2, Item3 as products in transactions)
test_apriori_improved(data_with_header, metric="confidence", has_header=False)

# Test with lift
test_apriori_improved(data_with_header, metric="lift", min_threshold=1.1, has_header=True)
