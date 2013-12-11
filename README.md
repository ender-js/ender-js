#ENDER-CORE

This is the home of Ender's client code. It's what provides the glue for pulling together otherwise independent modules into a single cohesive library.

## API

To create top level methods, like for example <code>$.myUtility(...)</code>, you can hook into Ender by calling the ender method:

    !function ($) {
      $.ender({
        myUtility: myLibFn
      });
    }(ender);

(*note - this is the default integration if no bridge is supplied*)

### The Internal chain

Another common case for Plugin developers is to be able hook into the internal collection chain. To do this, simply call the same <code>ender</code> method but pass <code>true</code> as the second argument:

    !function ($) {
      $.ender(myExtensions, true);
    }(ender);

Within this scope the internal prototype is exposed to the developer with an existing <code>elements</code> instance property representing the node collection. Have a look at how the [Bonzo DOM utility](https://github.com/ded/bonzo/blob/master/src/ender.js) does this. Also note that the internal chain can be augmented at any time (outside of this build) during your application. For example:

    <script src="ender.js"></script>
    <script>
    // an example of creating a utility that returns a random element from the matched set
    !function ($) {

      $.ender({
        rand: function () {
          return this[Math.floor(Math.random() * (this.length))];
        }
      }, true);

    }(ender);
    $('p').rand();
    </script>

### Selector Engine API

Ender also exposes a unique privileged variable called `$._select`, which allows you to set the Ender selector engine. Setting the selector engine provides ender with the $ method, like this:

``` js
$('#foo .bar')
```

Setting the selector engine is done like so:

``` js
$._select = mySelectorEngine;
```

You can see it in practice inside [Qwery's ender bridge](https://github.com/ded/qwery/blob/master/src/ender.js)

If you're building a Mobile Webkit or Android application, it may be a good idea to simply set it equal to QSA:

``` js
$._select = function (selector, root) {
  return (root || document).querySelectorAll(selector);
}
```

# License
Ender (the wrapper) is licensed under **MIT**. For individual modules, see respective module licenses.
