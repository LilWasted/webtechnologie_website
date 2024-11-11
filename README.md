# webtechnologie_website
https://gamergatherings.com/

database: 

   users:
- [x] username  
- [x] email
- [x] password
- [x] subscribed events (past events deleted)
- [x] rating (average rating on 10)
- [] profile picture (standard picture = fb profile picture)
- [x] time created
   
events:
- [x] title (name)
- [x] discription (summary)
- [x] datum
   - [ ] tijd invoegen TODO
- [x] categorie (game)
- [x] list of users (users)
- [x] max size
- [x] platform (pc, ps, xbox, switch)
- [x] organizer
- [x] time created
     
games or events:
- [x] name


TODO:
- [x] user aanmaken en register
- [ ] schema aanmaken voor db
- [x] ww hashen
- [ ] uitloggen

- [ ] events
   - [ ] users toevoegen aan event
   - [ ] users kunnen joinen (on update)
   - [ ] als user al in event zit, dan kan hij niet joinen
   - [ ] tijd implementeren voor start event
   - [ ] duur event (optionaal)
   - [ ] end time (optional)
   - [ ] toevoegen van availability option bij intializen
   - [ ] toevoegen updaten availability
      - [ ] als event is afgelopen, na 1 dag dan verwijderen uit db
      - [ ] als end time niet wordt gegeven, verwijderen na 1 dag start tijd

features:
1. api's
   - [ ] email
   - [ ] games list
   - [ ] discord
   - [ ] destiny 2 api
- [ ] organizer can kick a user and put him on blacklist
- [ ] party members can rate a player
- [ ] profile picture
