
'use strict';

const postcss = require('postcss');
const selectorParser = require('postcss-selector-parser');
const simpleSelectorParser = selectorParser();
 
module.exports = postcss.plugin('target-email', (opts = {}) => {

  opts.bodyClass = opts.bodyClass || 'body';
  opts.comment = opts.comment || false;
 
  function convertClientRules(css) {
    css.walkAtRules('client', (originalRule) => {
      const clients = originalRule.params.split(',').map((c) => c.trim());

      clients.forEach((client, i) => {
        const clientRule = createClientRule(originalRule, client);

        if (opts.comment)
          rule.before(postcss.comment({ text: `${client} ${clientConverters.hasOwnProperty(client) ? '' : ': unsupported'}` }));
        
        // always add in the client rule, even if its not supported
        originalRule.before(clientRule);

        if (clientConverters.hasOwnProperty(client)) {
          clientConverters[client](clientRule);
        }
      });

      originalRule.remove();
    });
  }

  const addBodyTargetInstance = (bodySelector, selector) => addBodyTarget(opts.bodyClass, bodySelector, selector); 
  

  const clientConverters = {
    // Source: https://www.htmlemailcheck.com/knowledge-base/target-yahoo-mail-using-css-media-query/
    yahoo(clientRule) {
      clientRule.name = 'media';
      clientRule.params = 'screen yahoo';
    },

    // Source: http://tabletrtd.com/email-client-targeting/
    webkit(clientRule) {
      clientRule.name = 'media';
      clientRule.params = 'screen and (-webkit-min-device-pixel-ratio: 0)';
    },

    // Source: https://www.emailonacid.com/blog/article/email-development/css-targeting-for-aol-mail
    aol(clientRule) {
      clientRule.walkRules((rule) => {
        rule.selector = addBodyTargetInstance(`body[class~="aolmail_${opts.bodyClass}"]`, rule.selector);

        clientRule.before(rule);
      });

      clientRule.remove();
    },
  
    // Source: http://freshinbox.com/blog/targeting-new-gmail-css/
    gmail(clientRule) {
      clientRule.walkRules((rule) => {
        rule.selector = addBodyTargetInstance(`u + .${opts.bodyClass}`, rule.selector);

        clientRule.before(rule);
      });

      clientRule.remove();
    },
    
    // Source: http://tabletrtd.com/email-client-targeting/
    'outlook-com'(clientRule) {
      clientRule.walkRules((rule) => {
        rule.selector = addWrapper(`[owa]`, rule.selector);

        clientRule.before(rule);
      });

      clientRule.remove();
    },

    // Source: http://tabletrtd.com/email-client-targeting/
    thunderbird(clientRule) {
      clientRule.walkRules((rule) => {
        rule.selector = addWrapper(`.moz-text-html`, rule.selector);

        clientRule.before(rule);
      });

      clientRule.remove();
    }
  }

  return convertClientRules;
});

/**
 * wraps the original selector to target a specific client
 * @param {String} wrapper  the wrapper selector
 * @param {String} selector the original selector
 *
 * @return {String} the new selector
 */
function addWrapper(wrapper, selector) {
  return simpleSelectorParser.process(selector).res.map((selector) => `${wrapper} ${String(selector).trim()}`);
}

/**
 * modifies or adds a body selector to target a specific client
 * @param {String} bodyClass    a possible alias for the body tag
 * @param {String} bodySelector the new selector for the body tag
 * @param {String} selector     the selector to modify
 *
 * @return {String} the new selector
 */
function addBodyTarget(bodyClass, bodySelector, selector) {
  const processor = selectorParser((selectors) => {
    
    // looping breaks if we replace dynamically
    // so instead collect an array of nodes to swap and do it at the end
    selectors.each((selector) => {
      let nodesToReplace = [];

      for (var i = 0; i < selector.nodes.length; i++) {
        const node = selector.nodes[i];

        if (node.value === 'body' && node.type === 'tag' || node.value === bodyClass && node.type === 'class') {
          nodesToReplace.push(node);
          break; // grab one node per selector
        }
      }
      
      if (nodesToReplace.length > 0) {
        replaceNodes(nodesToReplace, bodySelector);
      }
      else {
        prependSelector(selector, bodySelector);
      }
    })
  });

  return processor.process(selector).result;
}

/**
 * replaces an array of nodes with a new selector
 * @param  {Array}  nodes        an array of selectors
 * @param  {String} newSelector  the new selector to replace each node
 */
function replaceNodes(nodes, newSelector) {
    // get the selector nodes
  const newParts = simpleSelectorParser.process(newSelector).res.nodes[0].nodes;

  nodes.forEach(node => {
    // add on all the parts after
    newParts.slice(1).reverse().forEach((newNode, i) => {
      node.parent.insertAfter(node, newNode);
    });
    
    // replace the original node with the first one
    node.replaceWith(newParts[0]);
  });
}

/**
 * clones the rule and sets to only target one client
 * @param  {Rule}   originalRule
 * @param  {String} client       
 * @return {Rule}
 */
function createClientRule(originalRule, client) {
  const clientRule = originalRule.clone();
  clientRule.params = client;

  return clientRule;
}

/**
 * prepends the given selector to the original selector
 * @param  {Selector} selector    the original selector
 * @param  {String}   newSelector the selector to be added
 */
function prependSelector(selector, newSelector) {
  const nodes = simpleSelectorParser.process(newSelector).res.nodes[0].nodes;
  // add on all the body selector parts
  nodes.concat([selectorParser.combinator({value: ' '})]).reverse().forEach((newNode, i) => {
    selector.prepend(newNode);
  });
}