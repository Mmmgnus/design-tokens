import postcss from 'postcss';

function parseTokens(tokensSource) {
  const tokenList = [];

  for (const [group, tokens] of Object.entries(tokensSource)) {
    let type = tokens.$type;
    for (const [token, properties] of Object.entries(tokens)) {
      type = properties.$type || type;

      // type can be defined at this level, so we make sure the token actually is a token and not the token type definition.
      if (token[0] !== '$') {
        let value = properties.$value;

        // check if the value is referencing another token,
        // the format used for reference another token is {<group>.<token>}.
        if (value[0] === '{') {
          const [refGroup, refToken] = value.replace(/[{}]/g, '').split('.');
          value = `var(--${refGroup}-${refToken})`
        }

        tokenList.push({
          selector: `${group}-${token}`,
          type,
          value
        })
      }
    }
  }

  console.table(tokenList)
  return tokenList;
}

export function generateCSS(tokens) {
  if (!tokens) {
    throw new Error('Missing tokens')
  }

  const parsedTokens = parseTokens(tokens);
  const root = postcss.root();

  const rootScope = postcss.rule({ selector: ':root' })
  parsedTokens.forEach(({ selector, value }) => {
    rootScope.append({
      prop: `--${selector}`,
      value
    })
  })

  root.append(rootScope);

  return root.toString();
}
