db flow

- in schema show only false (hasSeen) news form db
- when false wala news ends, request newapi -> check if that url or news exists in db -> if yes check hasSeen variable (if true do not summarise it), if doesn't exists summarise it -> then get it from agent -> save in db -> show on frontend -> on swap mark hasSeen attribute as true.
