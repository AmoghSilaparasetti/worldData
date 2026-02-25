import pandas as pd

df1 = pd.read_csv("data/share-of-population-in-extreme-poverty.csv")
df2 = pd.read_csv("data/total-government-spending-on-education.csv")

merged_df = pd.merge(df1, df2, on="Entity", how='inner')
merged_df.to_csv("data/merged-data-inner.csv", index=False)