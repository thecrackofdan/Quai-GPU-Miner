/**
 * JSDoc Generator Utility
 * Helps generate JSDoc comments for functions
 */

/**
 * Generate JSDoc template for a function
 * @param {string} functionName - Name of the function
 * @param {Array} params - Array of parameter objects {name, type, description}
 * @param {string} returnType - Return type
 * @param {string} description - Function description
 * @returns {string} JSDoc comment
 */
function generateJSDoc(functionName, params = [], returnType = 'void', description = '') {
    let jsdoc = '/**\n';
    
    if (description) {
        jsdoc += ` * ${description}\n`;
        jsdoc += ' *\n';
    }
    
    params.forEach(param => {
        jsdoc += ` * @param {${param.type}} ${param.name} - ${param.description}\n`;
    });
    
    if (returnType !== 'void') {
        jsdoc += ` * @returns {${returnType}} ${returnType === 'Promise' ? 'Promise result' : 'Result'}\n`;
    }
    
    jsdoc += ' */';
    
    return jsdoc;
}

module.exports = {
    generateJSDoc
};

