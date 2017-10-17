# squarrels
Squarrels Game with Websockets!

## Setup
1. Install mongodb
2. `> npm install`
3. `> gulp serve`

## Animation
Only elements with the class 'animated' will be handled by the `$animation` and `.ng-*` classes

index.config.js
```
// See: https://goo.gl/FZH8u7
$animateProvider.classNameFilter( /\banimated\b/ );
```

## Components

### Main
### Shared

### Card
### Deck
### Game
### Player
### Players
### Storage Modal

```
localStorage.setItem('ngStorage-appConfig', JSON.stringify({ isAdmin: true}))
```
