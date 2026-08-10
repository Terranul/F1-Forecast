The server validates predictions on a weekly basis when results become available. I've set up a cron job to run weekly on Monday morning PST which will retrieve the most current results from the jolpi api, and then validate all predictions that were set the previous week.

Additionally, becuase of time zones the race could occur nearly over a day before the cron script executes. Solutions to this could be polling every hour between Saturday and Monday, or curating that execution date based on the race, but this is already complicated enough.

Sprint and Trial races are ignored, since it is way too much work to include these in the predictions, and the api data for them is slightly fucked. 

Another important note; I've made it so no predictions can be made from 00:00:00 on Saturday to 06:00:00 on Monday when the cron script executes. This is again because of time zones and simplicity since I want to be able to take all of the predictions from Monday to Friday and be confident they are all for the same session and trackName (compared to allowing predictions for the upcoming session whenever the current one finishes).

Finally this means I'll be running 2 cron scripts, one weekly on Saturday to tell the server to stop offering predictions, and another weekly on Monday to validate and begin accepting predictions again.

