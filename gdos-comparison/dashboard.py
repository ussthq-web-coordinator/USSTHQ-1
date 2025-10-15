import streamlit as st
import plotly.express as px
import pandas as pd
import json

# Load data
try:
    with open('GDOS-10-9-1-28.json', 'r') as f:
        data = json.load(f)
    if not isinstance(data, list):
        st.error("JSON data is not a list of objects. Please check the file format.")
        st.stop()
    df = pd.DataFrame(data)
    if df.empty:
        st.error("JSON data is empty. Please add data to the file.")
        st.stop()
except json.JSONDecodeError:
    st.error("Invalid JSON format. Please check the GDOS-10-9-1-28.json file.")
    st.stop()
except FileNotFoundError:
    st.error("GDOS-10-9-1-28.json file not found.")
    st.stop()

# Dashboard title
st.title("GDOS Data Visualization Dashboard")
st.write("Compare metrics across categories and time.")

# Sidebar for filters
st.sidebar.header("Filters")
if 'category' in df.columns:
    categories = st.sidebar.multiselect("Select Categories", df['category'].unique(), default=df['category'].unique())
else:
    categories = []
    st.sidebar.write("No 'category' column found.")

if 'date' in df.columns:
    date_range = st.sidebar.date_input("Select Date Range", [pd.to_datetime(df['date']).min(), pd.to_datetime(df['date']).max()])
else:
    date_range = []
    st.sidebar.write("No 'date' column found.")

# Filter data
filtered_df = df.copy()
if categories:
    filtered_df = filtered_df[filtered_df['category'].isin(categories)]
if date_range and len(date_range) == 2:
    filtered_df = filtered_df[(pd.to_datetime(filtered_df['date']) >= pd.to_datetime(date_range[0])) & (pd.to_datetime(filtered_df['date']) <= pd.to_datetime(date_range[1]))]

# Visualization 1: Line chart for trends over time
if 'date' in df.columns and 'value' in df.columns:
    st.subheader("Trend Comparison Over Time")
    fig1 = px.line(filtered_df, x='date', y='value', color='category' if 'category' in df.columns else None, title="Value Trends by Category")
    st.plotly_chart(fig1)

# Visualization 2: Bar chart for category comparison
if 'category' in df.columns and 'value' in df.columns:
    st.subheader("Category Comparison")
    fig2 = px.bar(filtered_df.groupby('category')['value'].sum().reset_index(), x='category', y='value', title="Total Value by Category")
    st.plotly_chart(fig2)

# Visualization 3: Scatter plot for correlation (if applicable)
if 'value' in df.columns and len([col for col in df.columns if col != 'value' and df[col].dtype in ['int64', 'float64']]) > 0:
    other_metric = [col for col in df.columns if col != 'value' and df[col].dtype in ['int64', 'float64']][0]
    st.subheader("Scatter Plot for Correlation")
    fig3 = px.scatter(filtered_df, x='value', y=other_metric, color='category' if 'category' in df.columns else None, title=f"Value vs. {other_metric}")
    st.plotly_chart(fig3)

# Raw data view
st.subheader("Raw Data")
st.dataframe(filtered_df)