# blindpy
A program in python to make blind tests using external buzzers

A blind/deaf test game in javascript+node. Available buzzers are :

    * PS2 Buzzers
    * GPIO Buzzers
    * WebBuzzer


INSTALL
-------

1. Have typescript installed : `$ npm install -g typescript`
2. Compile the sources : `$ tsc`
3. Links public files : ```
$ ln -s ../sounds public/ 
$ ln -s ../questions public/ .
```
4? Launch the game server : `$ node build/main.js --buzzer TYPE` (replace TYPE with one of the available types : `web`, `gpio`, `ps2`, `hid`)

TODO
----

3. reload or quit of master/game/buzzer
5. Really playing music :)
8. make master button disabled if no answers
9. timeout music play.
10. does not go to next music if points are <= 
11. Sound on buzz for answer
12. Wrong buzz answer sound

DONE
----

1. merge angularjs game & master apps in one app
2. show answers in master
4. waiting for buzzer to be ready
6. Best QRCode position
7. Display icons for game, master and buzzer and highlight when available
