Application has 3 screens: song search, song details and favorite list. You should to do next things:

1. Implement all empty methods ( `() => { }` )
==> (pandu) i may remove some method due it's redudancy (removeFromFavorites())

2. Data fetching

3. Correct rendering fetched data 

4. Fetched data must be persist when user switch screens
==> (pandu) using React Context API since it build-in with react-native lib itself, rather than redux

5. Implement navigation

6. Optional: deep link to Search song screen with search string as parameter
==> (pandu) as per usage of expo, the search and url should be exp://{server:port}/--/songlist?keyword={your string search}