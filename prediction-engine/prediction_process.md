## Goal: Sort of a random forest approach

You have a bunch of decision trees, and traversing them will give you the odds for the prediction category. You take the median of the odds, and this is what is put on the frontend

You input all of the fields you want to be considered (each field is a level on the tree), and the number ranges for the field. The model will select a random number within it for every single level, and random odds for each outcome. The model will then compare the results for each tree with the actual results, and select the top 3 trees. Then we'll create a bunch of mutations of these and keep iterating. 