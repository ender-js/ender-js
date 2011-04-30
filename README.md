ENDER-JS
--------

This is the home of ender's client code. It's what provides the glue for pulling together otherwise independent modules into a single cohesive library.

THE API
-------
The bridge is what Ender uses to connect modules to the main ender object.

<h3>noConflict</h3>

It's key to note that Ender users have the optional ability to call <code>noConflict()</code> on Ender in case the top-level <code>$</code> symbol is already taken. With that in mind, Developers should always wrap their Ender extensions as such:

    !function ($) {
      // extend ender
    }(ender);

<h3>Top level methods</h3>

To create top level methods, like for example <code>$.myUtility(...)</code>, you can hook into Ender by calling the ender method:

    !function ($) {
      $.ender({
        myUtility: myLibFn
      });
    }(ender);

(*note - this is the default integration if no bridge is supplied*)

<h3>The Internal chain</h3>

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

<h3>Selector Engine API</h3>

Ender also exposes a unique privileged variable called <code>$._select</code>, which allows you to set the Ender selector engine. Setting the selector engine provides ender with the $ method, like this:

    $('#foo .bar')

Setting the selector engine is done like so:

    $._select = mySelectorEngine;

You can see it in practice inside [Qwery's ender bridge](https://github.com/ded/qwery/blob/master/src/ender.js)

If you're building a Mobile Webkit or Android application, it may be a good idea to simply set it equal to QSA:

    $._select = function (selector, root) {
      return (root || document).querySelectorAll(selector);
    };

License
-------
Ender (the wrapper) is licensed under MIT - *copyright 2011 Dustin Diaz & Jacob Thornton*

For the individual modules, see their respective licenses.

Contributors
------------

* Dustin Diaz
  [@ded](https://github.com/ded/ender.js/commits/master?author=ded)
  ![ded](http://a2.twimg.com/profile_images/1115320538/ded.png)
  <div class="clear"></div>
* Jacob Thornton
  [@fat](https://github.com/ded/ender.js/commits/master?author=fat)
  ![fat](http://a1.twimg.com/profile_images/1213187079/eightbit-e3950b2f-24ee-4b03-9e1f-7e13c4cd9a68.png)
  <div class="clear"></div>