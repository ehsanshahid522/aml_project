import pandas as pd
from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder
import io

def test_apriori(csv_content, min_support=0.1, min_threshold=0.7, metric="lift"):
    print(f"\n--- Testing with min_support={min_support}, min_threshold={min_threshold}, metric={metric} ---")
    df = pd.read_csv(io.StringIO(csv_content), header=None)
    
    transactions = []
    values = df.values.tolist()
    for row in values:
        transaction = [str(item).strip() for item in row if pd.notna(item) and str(item).strip() != '']
        if transaction:
            transactions.append(transaction)
    
    print(f"Transactions: {transactions}")
    
    te = TransactionEncoder()
    te_ary = te.fit(transactions).transform(transactions)
    encoded_df = pd.DataFrame(te_ary, columns=te.columns_)
    
    frequent_itemsets = apriori(encoded_df, min_support=min_support, use_colnames=True)
    if frequent_itemsets.empty:
        print("No frequent itemsets found.")
        return

    print(f"Frequent Itemsets:\n{frequent_itemsets}")
    
    rules = association_rules(frequent_itemsets, metric=metric, min_threshold=min_threshold)
    if rules.empty:
        print("No rules found.")
        return

    print(f"Rules Found: {len(rules)}")
    print(rules[['antecedents', 'consequents', 'support', 'confidence', 'lift']])

# Sample data
data = """Milk,Bread,Eggs
Milk,Bread
Milk,Eggs
Bread,Eggs
Milk,Bread,Eggs"""

# Test with current app logic (metric="lift")
test_apriori(data, metric="lift")

# Test with confidence (likely what user wants)
test_apriori(data, metric="confidence")

# Test with headers (to see if it breaks)
data_with_header = """Item1,Item2,Item3
Milk,Bread,Eggs
Milk,Bread
Milk,Eggs
Bread,Eggs
Milk,Bread,Eggs"""
print("\n--- Testing with headers ---")
test_apriori(data_with_header, metric="lift")
