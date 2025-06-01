# jQuery-whac-a-mole

This library implements a whac-a-mole game where players need to click on targets that appear randomly in a grid within a time limit.

## Installation

Import directly in html file.

``` html
<!-- HTML -->

<link href="path/jQuery-whac-a-mole/whac-a-mole.css" rel="stylesheet">
<link href="path/jQuery-whac-a-mole/shake.css" rel="stylesheet">
<script src="path/jQuery-whac-a-mole/whac-a-mole.js"></script>
```

## Usage

### Library settings

``` bash
# Edit default style
vi path/jQuery-whac-a-mole/whac-a-mole.css
vi path/jQuery-whac-a-mole/shake.css

# Edit default setting
vi path/jQuery-whac-a-mole/whac-a-mole.js
```

### How to use

``` html
<!-- HTML -->

<!-- Add data attribute "WKWAM" to your game container -->
<div data-game="WKWAM"></div>
```

``` javascript
<!-- JavaScript -->

// Initialize the whac-a-mole game
$('[data-game="WKWAM"]').WKWhacAMole();
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
