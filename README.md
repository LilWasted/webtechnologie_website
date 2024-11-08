# webtechnologie_website
https://gamergatherings.com/

database: 

   users:
1. username
2. email
3. password (hashed)
4. subscribed events (past events deleted)
5. rating (average rating on 10)
6. profile picture (standard picture = fb profile picture)
6. time created
   
events:
1. title (name)
2. discription (summary)
3. datum
   1. tijd invoegen TODO
4. categorie (game)
5. list of users (users)
6. max size
7. platform (pc, ps, xbox, switch)
8. organizer
7. time created
     
games of events:
1. name


TODO:
1. user aanmaken en register
   2. schema aanmaken voor db
   1. ww hashen


3. events
   1. users toevoegen aan schema
   2. users kunnen joinen (on update)
      3. als user al in event zit, dan kan hij niet joinen
   3. tijd implementeren voor start event
   4. duur event (optionaal)
   5. end time (optional)
      6. als event is afgelopen, na 1 dag dan verwijderen uit db
      7. als end time niet wordt gegeven, verwijderen na 1 dag start tijd
   6. 






features:
1. api's
   3. email
   4. games list
   2. discord
   5. destiny 2 api
1. orgonizer can kick a user and put him on blacklist
2. party members can rate a player
3. profile picture
