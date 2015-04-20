(function () {

  'use strict';

  function dynamicWatcher (expr, notifier) {
    function wrap (watchDelegate, scope, listener, objectEquality, parsedExpression) {
      var delegateCall = watchDelegate.bind(this, scope, listener, objectEquality, parsedExpression);
      scope.$on('$$rebind::' + notifier, delegateCall);
      delegateCall();
    }

    return wrap.bind(this, expr.$$watchDelegate);
  }

  function $parseDecorator ($delegate, bindNotifierRegex) {
    function wrap (parse, exp, interceptor) {
      var match, expression, rawExpression, notifier;

      if (typeof exp === 'string' && (match = exp.match(bindNotifierRegex))) {
        notifier      = match[1];
        rawExpression = match[2];

        expression = parse.call(this, '::' + rawExpression, interceptor);
        expression.$$watchDelegate = dynamicWatcher(expression, notifier);

        return expression;
      } else {
        var args = [exp, interceptor];
        if (!interceptor) { args.pop(); }
        return parse.apply(this, args);
      }
    }

    return wrap.bind(null, $delegate);
  }
  $parseDecorator.$inject = ['$delegate', 'bindNotifierRegex'];

  angular
    .module('angular-bind-notifier')
    .constant('bindNotifierRegex', /^:([a-zA-Z0-9][\w-]*):(.+)$/)
    .config(function ($provide) {
      $provide.decorator('$parse', $parseDecorator);
    });

}());
