def fix_error_table(error_table, cities_data)
    cur_cols = [
        "Ensemble",
        *map(
            lambda work_regressor: type(work_regressor).__name__.replace("Regressor", ""),
            cur_regressor_list
        )
    ]

    error_table = pd.DataFrame(
        error_table, index=cities_data.index, columns=cur_cols
    )

    error_table = 100 * error_table.round(2)
    error_table = error_table.astype(int)

    error_table
