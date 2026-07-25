To restrict serving certain html files to users that haven't logged in yet, we need to manually determine when we send html to the frontend

Before we would send the entirety of the public folder to the frontend, so users could access pages when not logged in.

Now we'll put only the index.html and login.js files in the public folder becuase this is the only page we want unauthenticated users to access

Everything else will be put in the new private folder and when a request comes in to access the file, we can specifically check if the user has a session open before serving


CAT
--<>()-   
 \/ \/