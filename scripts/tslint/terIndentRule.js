"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ts = require('typescript');
var Lint = require('tslint/lib/lint');
var RULE_NAME = 'ter-indent';
var DEFAULT_VARIABLE_INDENT = 1;
var DEFAULT_PARAMETER_INDENT = null;
var DEFAULT_FUNCTION_BODY_INDENT = 1;
var indentType = 'space';
var indentSize = 4;
var OPTIONS;
function assign(target) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    sources.forEach(function (source) {
        if (source !== undefined && source !== null) {
            for (var nextKey in source) {
                if (source.hasOwnProperty(nextKey)) {
                    target[nextKey] = source[nextKey];
                }
            }
        }
    });
    return target;
}
function isKind(node, kind) {
    return node.kind === ts.SyntaxKind[kind];
}
function isOneOf(node, kinds) {
    return kinds.some(function (kind) { return node.kind === ts.SyntaxKind[kind]; });
}
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        _super.apply(this, arguments);
    }
    Rule.prototype.apply = function (sourceFile) {
        var walker = new IndentWalker(sourceFile, this.getOptions());
        return this.applyWithWalker(walker);
    };
    Rule.metadata = {
        ruleName: RULE_NAME,
        description: 'enforce consistent indentation',
        rationale: (_a = ["\n      Using only one of tabs or spaces for indentation leads to more consistent editor behavior,\n      cleaner diffs in version control, and easier programmatic manipulation.\n      "], _a.raw = ["\n      Using only one of tabs or spaces for indentation leads to more consistent editor behavior,\n      cleaner diffs in version control, and easier programmatic manipulation.\n      "], Lint.Utils.dedent(_a)),
        optionsDescription: (_b = ["\n      The string 'tab' or an integer indicating the number of spaces to use per tab.\n\n      An object may be provided to fine tune the indentation rules:\n            \n        * `\"SwitchCase\"` (default: 0) enforces indentation level for `case` clauses in\n                           `switch` statements\n        * `\"VariableDeclarator\"` (default: 1) enforces indentation level for `var` declarators;\n                                   can also take an object to define separate rules for `var`,\n                                   `let` and `const` declarations.\n        * `\"outerIIFEBody\"` (default: 1) enforces indentation level for file-level IIFEs.\n        * `\"MemberExpression\"` (off by default) enforces indentation level for multi-line\n                                 property chains (except in variable declarations and assignments)\n        * `\"FunctionDeclaration\"` takes an object to define rules for function declarations.\n            * `\"parameters\"` (off by default) enforces indentation level for parameters in a\n                               function declaration. This can either be a number indicating\n                               indentation level, or the string `\"first\"` indicating that all\n                               parameters of the declaration must be aligned with the first parameter.\n            * `\"body\"` (default: 1) enforces indentation level for the body of a function expression.\n        * `\"FunctionExpression\"` takes an object to define rules for function declarations.\n            * `\"parameters\"` (off by default) enforces indentation level for parameters in a\n                               function declaration. This can either be a number indicating\n                               indentation level, or the string `\"first\"` indicating that all\n                               parameters of the declaration must be aligned with the first parameter.\n            * `\"body\"` (default: 1) enforces indentation level for the body of a function expression.\n      "], _b.raw = ["\n      The string 'tab' or an integer indicating the number of spaces to use per tab.\n\n      An object may be provided to fine tune the indentation rules:\n            \n        * \\`\"SwitchCase\"\\` (default: 0) enforces indentation level for \\`case\\` clauses in\n                           \\`switch\\` statements\n        * \\`\"VariableDeclarator\"\\` (default: 1) enforces indentation level for \\`var\\` declarators;\n                                   can also take an object to define separate rules for \\`var\\`,\n                                   \\`let\\` and \\`const\\` declarations.\n        * \\`\"outerIIFEBody\"\\` (default: 1) enforces indentation level for file-level IIFEs.\n        * \\`\"MemberExpression\"\\` (off by default) enforces indentation level for multi-line\n                                 property chains (except in variable declarations and assignments)\n        * \\`\"FunctionDeclaration\"\\` takes an object to define rules for function declarations.\n            * \\`\"parameters\"\\` (off by default) enforces indentation level for parameters in a\n                               function declaration. This can either be a number indicating\n                               indentation level, or the string \\`\"first\"\\` indicating that all\n                               parameters of the declaration must be aligned with the first parameter.\n            * \\`\"body\"\\` (default: 1) enforces indentation level for the body of a function expression.\n        * \\`\"FunctionExpression\"\\` takes an object to define rules for function declarations.\n            * \\`\"parameters\"\\` (off by default) enforces indentation level for parameters in a\n                               function declaration. This can either be a number indicating\n                               indentation level, or the string \\`\"first\"\\` indicating that all\n                               parameters of the declaration must be aligned with the first parameter.\n            * \\`\"body\"\\` (default: 1) enforces indentation level for the body of a function expression.\n      "], Lint.Utils.dedent(_b)),
        options: {
            type: 'array',
            items: [{
                    type: 'number',
                    minimum: '0'
                }, {
                    type: 'string',
                    enum: ['tab']
                }, {
                    type: 'object',
                    properties: {
                        SwitchCase: {
                            type: 'number',
                            minimum: 0
                        },
                        VariableDeclarator: {
                            type: 'object',
                            properties: {
                                var: {
                                    type: 'number',
                                    minimum: 0
                                },
                                let: {
                                    type: 'number',
                                    minimum: 0
                                },
                                const: {
                                    type: 'number',
                                    minimum: 0
                                }
                            }
                        },
                        outerIIFEBody: {
                            type: 'number'
                        },
                        FunctionDeclaration: {
                            type: 'object',
                            properties: {
                                parameters: {
                                    type: 'number',
                                    minimum: 0
                                },
                                body: {
                                    type: 'number',
                                    minimum: 0
                                }
                            }
                        },
                        FunctionExpression: {
                            type: 'object',
                            properties: {
                                parameters: {
                                    type: 'number',
                                    minimum: 0
                                },
                                body: {
                                    type: 'number',
                                    minimum: 0
                                }
                            }
                        },
                        MemberExpression: {
                            type: 'number'
                        }
                    },
                    additionalProperties: false
                }],
            minLength: 1,
            maxLength: 2
        },
        optionExamples: [
            (_c = ["\n        \"", "\": [true, \"tab\"]\n        "], _c.raw = ["\n        \"", "\": [true, \"tab\"]\n        "], Lint.Utils.dedent(_c, RULE_NAME)),
            (_d = ["\n        \"", "\": [true, 2]\n        "], _d.raw = ["\n        \"", "\": [true, 2]\n        "], Lint.Utils.dedent(_d, RULE_NAME)),
            (_e = ["\n        \"", "\": [\n          true,\n          2,\n          {\n            \"FunctionExpression\": {\n              \"parameters\": 1,\n              \"body\": 1\n            }\n          }\n        ]      \n        "], _e.raw = ["\n        \"", "\": [\n          true,\n          2,\n          {\n            \"FunctionExpression\": {\n              \"parameters\": 1,\n              \"body\": 1\n            }\n          }\n        ]      \n        "], Lint.Utils.dedent(_e, RULE_NAME))
        ],
        type: 'maintainability'
    };
    return Rule;
    var _a, _b, _c, _d, _e;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var IndentWalker = (function (_super) {
    __extends(IndentWalker, _super);
    function IndentWalker(sourceFile, options) {
        _super.call(this, sourceFile, options);
        this.caseIndentStore = {};
        this.varIndentStore = {};
        OPTIONS = {
            SwitchCase: 0,
            VariableDeclarator: {
                var: DEFAULT_VARIABLE_INDENT,
                let: DEFAULT_VARIABLE_INDENT,
                const: DEFAULT_VARIABLE_INDENT
            },
            outerIIFEBody: null,
            FunctionDeclaration: {
                parameters: DEFAULT_PARAMETER_INDENT,
                body: DEFAULT_FUNCTION_BODY_INDENT
            },
            FunctionExpression: {
                parameters: DEFAULT_PARAMETER_INDENT,
                body: DEFAULT_FUNCTION_BODY_INDENT
            }
        };
        var firstParam = this.getOptions()[0];
        if (firstParam === 'tab') {
            indentSize = 1;
            indentType = 'tab';
        }
        else {
            indentSize = firstParam || 4;
            indentType = 'space';
        }
        var userOptions = this.getOptions()[1];
        if (userOptions) {
            OPTIONS.SwitchCase = userOptions.SwitchCase || 0;
            if (typeof userOptions.VariableDeclarator === 'number') {
                OPTIONS.VariableDeclarator = {
                    var: userOptions.VariableDeclarator,
                    let: userOptions.VariableDeclarator,
                    const: userOptions.VariableDeclarator
                };
            }
            else if (typeof userOptions.VariableDeclarator === 'object') {
                assign(OPTIONS.VariableDeclarator, userOptions.VariableDeclarator);
            }
            if (typeof userOptions.outerIIFEBody === 'number') {
                OPTIONS.outerIIFEBody = userOptions.outerIIFEBody;
            }
            if (typeof userOptions.MemberExpression === 'number') {
                OPTIONS.MemberExpression = userOptions.MemberExpression;
            }
            if (typeof userOptions.FunctionDeclaration === 'object') {
                assign(OPTIONS.FunctionDeclaration, userOptions.FunctionDeclaration);
            }
            if (typeof userOptions.FunctionExpression === 'object') {
                assign(OPTIONS.FunctionExpression, userOptions.FunctionExpression);
            }
        }
        this.srcFile = sourceFile;
        this.srcText = sourceFile.getFullText();
    }
    IndentWalker.prototype.getSourceSubstr = function (start, end) {
        return this.srcText.substr(start, end - start);
    };
    IndentWalker.prototype.getLineAndCharacter = function (node, byEndLocation) {
        if (byEndLocation === void 0) { byEndLocation = false; }
        var index = byEndLocation ? node.getEnd() : node.getStart();
        return this.srcFile.getLineAndCharacterOfPosition(index);
    };
    IndentWalker.prototype.getLine = function (node, byEndLocation) {
        if (byEndLocation === void 0) { byEndLocation = false; }
        return this.getLineAndCharacter(node, byEndLocation).line;
    };
    IndentWalker.prototype.createErrorMessage = function (expectedAmount, actualSpaces, actualTabs) {
        var expectedStatement = expectedAmount + " " + indentType + (expectedAmount === 1 ? '' : 's');
        var foundSpacesWord = "space" + (actualSpaces === 1 ? '' : 's');
        var foundTabsWord = "tab" + (actualTabs === 1 ? '' : 's');
        var foundStatement;
        if (actualSpaces > 0 && actualTabs > 0) {
            foundStatement = actualSpaces + " " + foundSpacesWord + " and " + actualTabs + " " + foundTabsWord;
        }
        else if (actualSpaces > 0) {
            foundStatement = indentType === 'space' ? actualSpaces : actualSpaces + " " + foundSpacesWord;
        }
        else if (actualTabs > 0) {
            foundStatement = indentType === 'tab' ? actualTabs : actualTabs + " " + foundTabsWord;
        }
        else {
            foundStatement = '0';
        }
        return "Expected indentation of " + expectedStatement + " but found " + foundStatement + ".";
    };
    IndentWalker.prototype.report = function (node, needed, gottenSpaces, gottenTabs) {
        if (gottenSpaces && gottenTabs) {
            return;
        }
        var msg = this.createErrorMessage(needed, gottenSpaces, gottenTabs);
        var width = gottenSpaces + gottenTabs;
        this.addFailure(this.createFailure(node.getStart() - width, width, msg));
    };
    IndentWalker.prototype.isNodeFirstInLine = function (node, byEndLocation) {
        if (byEndLocation === void 0) { byEndLocation = false; }
        var token = byEndLocation ? node.getLastToken() : node.getFirstToken();
        var pos = token.getStart() - 1;
        while ([' ', '\t'].indexOf(this.srcText.charAt(pos)) !== -1) {
            pos -= 1;
        }
        return this.srcText.charAt(pos) === '\n';
    };
    IndentWalker.prototype.getNodeIndent = function (node) {
        if (node === this.getSourceFile()) {
            return { space: 0, tab: 0, goodChar: 0, badChar: 0 };
        }
        if (node.kind === ts.SyntaxKind.SyntaxList) {
            return this.getNodeIndent(node.parent);
        }
        var endIndex = node.getStart();
        var pos = endIndex - 1;
        while (pos > 0 && this.srcText.charAt(pos) !== '\n') {
            pos -= 1;
        }
        var str = this.getSourceSubstr(pos + 1, endIndex);
        var whiteSpace = (str.match(/^\s+/) || [''])[0];
        var indentChars = whiteSpace.split('');
        var spaces = indentChars.filter(function (char) { return char === ' '; }).length;
        var tabs = indentChars.filter(function (char) { return char === '\t'; }).length;
        var firstInLine = false;
        var comments = ts.getLeadingCommentRanges(node.getFullText(), 0);
        if (comments && comments.length) {
            var offset = node.getFullStart();
            var lastComment = comments[comments.length - 1];
            var comment = this.getSourceSubstr(lastComment.pos + offset, lastComment.end + offset);
            if (comment.indexOf('\n') !== -1) {
                firstInLine = true;
            }
        }
        return {
            firstInLine: spaces + tabs === str.length || firstInLine,
            space: spaces,
            tab: tabs,
            goodChar: indentType === 'space' ? spaces : tabs,
            badChar: indentType === 'space' ? tabs : spaces
        };
    };
    IndentWalker.prototype.checkNodeIndent = function (node, neededIndent) {
        var actualIndent = this.getNodeIndent(node);
        if (!isKind(node, 'ArrayLiteralExpression') &&
            !isKind(node, 'ObjectLiteralExpression') &&
            (actualIndent.goodChar !== neededIndent || actualIndent.badChar !== 0) &&
            actualIndent.firstInLine) {
            this.report(node, neededIndent, actualIndent.space, actualIndent.tab);
        }
        if (isKind(node, 'IfStatement')) {
            var elseStatement = node.elseStatement;
            if (elseStatement) {
                var elseKeyword = node.getChildren().filter(function (ch) { return isKind(ch, 'ElseKeyword'); }).shift();
                this.checkNodeIndent(elseKeyword, neededIndent);
                if (!this.isNodeFirstInLine(elseStatement)) {
                    this.checkNodeIndent(elseStatement, neededIndent);
                }
            }
        }
    };
    IndentWalker.prototype.isSingleLineNode = function (node) {
        var text = node.kind === ts.SyntaxKind.SyntaxList ? node.getFullText() : node.getText();
        return text.indexOf('\n') === -1;
    };
    IndentWalker.prototype.blockIndentationCheck = function (node) {
        if (this.isSingleLineNode(node)) {
            return;
        }
        var functionLike = ['FunctionExpression', 'FunctionDeclaration', 'ArrowFunction'];
        if (node.parent && isOneOf(node.parent, functionLike)) {
            this.checkIndentInFunctionBlock(node);
            return;
        }
        var indent;
        var nodesToCheck = [];
        var statementsWithProperties = [
            'IfStatement',
            'WhileStatement',
            'ForStatement',
            'ForInStatement',
            'ForOfStatement',
            'DoStatement',
            'ClassDeclaration',
            'ClassExpression',
            'SourceFile'
        ];
        if (node.parent && isOneOf(node.parent, statementsWithProperties) && this.isNodeBodyBlock(node)) {
            indent = this.getNodeIndent(node.parent).goodChar;
        }
        else {
            indent = this.getNodeIndent(node).goodChar;
        }
        if (isKind(node, 'IfStatement') && !isKind(node['thenStatement'], 'Block')) {
            nodesToCheck = [node['thenStatement']];
        }
        else {
            if (node.kind === ts.SyntaxKind.Block) {
                nodesToCheck = node.getChildren()[1].getChildren();
            }
            else if (isOneOf(node.parent, ['ClassDeclaration', 'ClassExpression'])) {
                nodesToCheck = node.getChildren();
            }
            else {
                nodesToCheck = [node.statement];
            }
        }
        this.checkNodeIndent(node, indent);
        if (nodesToCheck.length > 0) {
            this.checkNodesIndent(nodesToCheck, indent + indentSize);
        }
        if (isKind(node, 'Block')) {
            this.checkLastNodeLineIndent(node, indent);
        }
    };
    IndentWalker.prototype.isClassLike = function (node) {
        return isOneOf(node, ['ClassDeclaration', 'ClassExpression']);
    };
    IndentWalker.prototype.isAssignment = function (node) {
        if (!isKind(node, 'BinaryExpression')) {
            return false;
        }
        return node.operatorToken.getText() === '=';
    };
    IndentWalker.prototype.isNodeBodyBlock = function (node) {
        return node.kind === ts.SyntaxKind.Block ||
            (node.kind === ts.SyntaxKind.SyntaxList && this.isClassLike(node.parent.kind));
    };
    IndentWalker.prototype.checkFirstNodeLineIndent = function (node, firstLineIndent) {
        var startIndent = this.getNodeIndent(node);
        var firstInLine = startIndent.firstInLine;
        if (firstInLine && (startIndent.goodChar !== firstLineIndent || startIndent.badChar !== 0)) {
            this.report(node, firstLineIndent, startIndent.space, startIndent.tab);
        }
    };
    IndentWalker.prototype.checkLastNodeLineIndent = function (node, lastLineIndent) {
        var lastToken = node.getLastToken();
        var endIndent = this.getNodeIndent(lastToken);
        var firstInLine = endIndent.firstInLine;
        if (firstInLine && (endIndent.goodChar !== lastLineIndent || endIndent.badChar !== 0)) {
            this.report(lastToken, lastLineIndent, endIndent.space, endIndent.tab);
        }
    };
    IndentWalker.prototype.isOuterIIFE = function (node) {
        var parent = node.parent;
        var expressionIsNode = parent.expression !== node;
        if (isKind(parent, 'ParenthesizedExpression')) {
            parent = parent.parent;
        }
        var stmt = parent.parent;
        if (!isKind(parent, 'CallExpression') || expressionIsNode) {
            return false;
        }
        while (isKind(stmt, 'PrefixUnaryExpression') && (stmt.operator === ts.SyntaxKind.ExclamationToken ||
            stmt.operator === ts.SyntaxKind.TildeToken ||
            stmt.operator === ts.SyntaxKind.PlusToken ||
            stmt.operator === ts.SyntaxKind.MinusToken) ||
            isKind(stmt, 'BinaryExpression') ||
            isKind(stmt, 'SyntaxList') ||
            isKind(stmt, 'VariableDeclaration') ||
            isKind(stmt, 'VariableDeclarationList') ||
            isKind(stmt, 'ParenthesizedExpression')) {
            stmt = stmt.parent;
        }
        return ((isKind(stmt, 'ExpressionStatement') ||
            isKind(stmt, 'VariableStatement')) &&
            stmt.parent && isKind(stmt.parent, 'SourceFile'));
    };
    IndentWalker.prototype.isArgBeforeCalleeNodeMultiline = function (node) {
        var parent = node.parent;
        if (parent['arguments'].length >= 2 && parent['arguments'][1] === node) {
            var firstArg = parent['arguments'][0];
            return this.getLine(firstArg, true) > this.getLine(firstArg);
        }
        return false;
    };
    IndentWalker.prototype.checkIndentInFunctionBlock = function (node) {
        var calleeNode = node.parent;
        var indent = this.getNodeIndent(calleeNode).goodChar;
        if (calleeNode.parent.kind === ts.SyntaxKind.CallExpression) {
            var calleeParent = calleeNode.parent;
            if (calleeNode.kind !== ts.SyntaxKind.FunctionExpression && calleeNode.kind !== ts.SyntaxKind.ArrowFunction) {
                if (calleeParent && this.getLine(calleeParent) < this.getLine(node)) {
                    indent = this.getNodeIndent(calleeParent).goodChar;
                }
            }
            else {
                var callee = calleeParent.expression;
                if (this.isArgBeforeCalleeNodeMultiline(calleeNode) &&
                    this.getLine(callee) === this.getLine(callee, true) &&
                    !this.isNodeFirstInLine(calleeNode)) {
                    indent = this.getNodeIndent(calleeParent).goodChar;
                }
            }
        }
        var functionOffset = indentSize;
        if (OPTIONS.outerIIFEBody !== null && this.isOuterIIFE(calleeNode)) {
            functionOffset = OPTIONS.outerIIFEBody * indentSize;
        }
        else if (calleeNode.kind === ts.SyntaxKind.FunctionExpression) {
            functionOffset = OPTIONS.FunctionExpression.body * indentSize;
        }
        else if (calleeNode.kind === ts.SyntaxKind.FunctionDeclaration) {
            functionOffset = OPTIONS.FunctionDeclaration.body * indentSize;
        }
        indent += functionOffset;
        var parentVarNode = this.getVariableDeclaratorNode(node);
        if (parentVarNode && this.isNodeInVarOnTop(node, parentVarNode)) {
            var varKind = parentVarNode.parent.getFirstToken().getText();
            indent += indentSize * OPTIONS.VariableDeclarator[varKind];
        }
        if (node.statements.length) {
            this.checkNodesIndent(node.statements, indent);
        }
        this.checkLastNodeLineIndent(node, indent - functionOffset);
    };
    IndentWalker.prototype.checkNodesIndent = function (nodes, indent) {
        var _this = this;
        nodes.forEach(function (node) { return _this.checkNodeIndent(node, indent); });
    };
    IndentWalker.prototype.expectedCaseIndent = function (node, switchIndent) {
        var switchNode = (node.kind === ts.SyntaxKind.SwitchStatement) ? node : node.parent;
        var line = this.getLine(switchNode);
        var caseIndent;
        if (this.caseIndentStore[line]) {
            return this.caseIndentStore[line];
        }
        else {
            if (typeof switchIndent === 'undefined') {
                switchIndent = this.getNodeIndent(switchNode).goodChar;
            }
            caseIndent = switchIndent + (indentSize * OPTIONS.SwitchCase);
            this.caseIndentStore[line] = caseIndent;
            return caseIndent;
        }
    };
    IndentWalker.prototype.expectedVarIndent = function (node, varIndent) {
        var varNode = node.parent.parent;
        var line = this.getLine(varNode);
        var indent;
        if (this.varIndentStore[line]) {
            return this.varIndentStore[line];
        }
        else {
            if (typeof varIndent === 'undefined') {
                varIndent = this.getNodeIndent(varNode).goodChar;
            }
            var varKind = varNode.getFirstToken().getText();
            indent = varIndent + (indentSize * OPTIONS.VariableDeclarator[varKind]);
            this.varIndentStore[line] = indent;
            return indent;
        }
    };
    IndentWalker.prototype.getParentNodeByType = function (node, kind) {
        var parent = node.parent;
        while (parent.kind !== kind && parent.kind !== ts.SyntaxKind.SourceFile) {
            parent = parent.parent;
        }
        return parent.kind === kind ? parent : null;
    };
    IndentWalker.prototype.getVariableDeclaratorNode = function (node) {
        return this.getParentNodeByType(node, ts.SyntaxKind.VariableDeclaration);
    };
    IndentWalker.prototype.getBinaryExpressionNode = function (node) {
        return this.getParentNodeByType(node, ts.SyntaxKind.BinaryExpression);
    };
    IndentWalker.prototype.checkIndentInArrayOrObjectBlock = function (node) {
        if (this.isSingleLineNode(node)) {
            return;
        }
        var elements = isKind(node, 'ObjectLiteralExpression') ? node['properties'] : node['elements'];
        elements = elements.filter(function (elem) {
            return elem.getText() !== '';
        });
        if (elements.length && this.getLine(elements[0]) === this.getLine(node)) {
            return;
        }
        var nodeLine = this.getLine(node);
        var nodeEndLine = this.getLine(node, true);
        if (elements.length) {
            var firstElementLine = this.getLine(elements[0]);
            if (nodeLine === firstElementLine) {
                return;
            }
        }
        var nodeIndent;
        var elementsIndent;
        var varKind;
        var parentVarNode = this.getVariableDeclaratorNode(node);
        if (this.isNodeFirstInLine(node)) {
            var parent_1 = node.parent;
            var effectiveParent = parent_1;
            if (parent_1.kind === ts.SyntaxKind.PropertyDeclaration) {
                if (this.isNodeFirstInLine(parent_1)) {
                    effectiveParent = parent_1.parent.parent;
                }
                else {
                    effectiveParent = parent_1.parent;
                }
            }
            nodeIndent = this.getNodeIndent(effectiveParent).goodChar;
            if (parentVarNode && this.getLine(parentVarNode) !== nodeLine) {
                if (!isKind(parent_1, 'VariableDeclaration') || parentVarNode === parentVarNode.parent.declarations[0]) {
                    var parentVarLine = this.getLine(parentVarNode);
                    var effectiveParentLine = this.getLine(effectiveParent);
                    if (isKind(parent_1, 'VariableDeclaration') && parentVarLine === effectiveParentLine) {
                        varKind = parentVarNode.parent.getFirstToken().getText();
                        nodeIndent = nodeIndent + (indentSize * OPTIONS.VariableDeclarator[varKind]);
                    }
                    else if (isOneOf(parent_1, [
                        'ObjectLiteralExpression',
                        'ArrayLiteralExpression',
                        'CallExpression',
                        'ArrowFunction',
                        'NewExpression',
                        'BinaryExpression'
                    ])) {
                        nodeIndent = nodeIndent + indentSize;
                    }
                }
            }
            else if (!parentVarNode &&
                !this.isFirstArrayElementOnSameLine(parent_1) &&
                effectiveParent.kind !== ts.SyntaxKind.PropertyAccessExpression &&
                effectiveParent.kind !== ts.SyntaxKind.ExpressionStatement &&
                effectiveParent.kind !== ts.SyntaxKind.PropertyAssignment &&
                !(this.isAssignment(effectiveParent))) {
                nodeIndent = nodeIndent + indentSize;
            }
            elementsIndent = nodeIndent + indentSize;
            this.checkFirstNodeLineIndent(node, nodeIndent);
        }
        else {
            nodeIndent = this.getNodeIndent(node).goodChar;
            elementsIndent = nodeIndent + indentSize;
        }
        if (parentVarNode && this.isNodeInVarOnTop(node, parentVarNode)) {
            varKind = parentVarNode.parent.getFirstToken().getText();
            elementsIndent += indentSize * OPTIONS.VariableDeclarator[varKind];
        }
        this.checkNodesIndent(elements, elementsIndent);
        if (elements.length > 0) {
            var lastLine = this.getLine(elements[elements.length - 1], true);
            if (lastLine === nodeEndLine) {
                return;
            }
        }
        this.checkLastNodeLineIndent(node, elementsIndent - indentSize);
    };
    IndentWalker.prototype.isFirstArrayElementOnSameLine = function (node) {
        if (isKind(node, 'ArrayLiteralExpression')) {
            var ele = node.elements[0];
            if (ele) {
                return isKind(ele, 'ObjectLiteralExpression') && this.getLine(ele) === this.getLine(node);
            }
        }
        return false;
    };
    IndentWalker.prototype.isNodeInVarOnTop = function (node, varNode) {
        var nodeLine = this.getLine(node);
        var parentLine = this.getLine(varNode.parent);
        return varNode &&
            parentLine === nodeLine &&
            varNode.parent.declarations.length > 1;
    };
    IndentWalker.prototype.blockLessNodes = function (node) {
        if (!isKind(node.statement, 'Block')) {
            this.blockIndentationCheck(node);
        }
    };
    IndentWalker.prototype.checkIndentInVariableDeclarations = function (node) {
        var indent = this.expectedVarIndent(node);
        this.checkNodeIndent(node, indent);
    };
    IndentWalker.prototype.visitCase = function (node) {
        if (this.isSingleLineNode(node)) {
            return;
        }
        var caseIndent = this.expectedCaseIndent(node);
        this.checkNodesIndent(node.statements, caseIndent + indentSize);
    };
    IndentWalker.prototype.visitClassDeclaration = function (node) {
        var len = node.getChildCount();
        this.blockIndentationCheck(node.getChildAt(len - 2));
        _super.prototype.visitClassDeclaration.call(this, node);
    };
    IndentWalker.prototype.visitClassExpression = function (node) {
        var len = node.getChildCount();
        this.blockIndentationCheck(node.getChildAt(len - 2));
        _super.prototype.visitClassExpression.call(this, node);
    };
    IndentWalker.prototype.visitBlock = function (node) {
        this.blockIndentationCheck(node);
        _super.prototype.visitBlock.call(this, node);
    };
    IndentWalker.prototype.visitIfStatement = function (node) {
        var thenLine = this.getLine(node.thenStatement);
        var line = this.getLine(node);
        if (node.thenStatement.kind !== ts.SyntaxKind.Block && thenLine > line) {
            this.blockIndentationCheck(node);
        }
        _super.prototype.visitIfStatement.call(this, node);
    };
    IndentWalker.prototype.visitObjectLiteralExpression = function (node) {
        this.checkIndentInArrayOrObjectBlock(node);
        _super.prototype.visitObjectLiteralExpression.call(this, node);
    };
    IndentWalker.prototype.visitArrayLiteralExpression = function (node) {
        this.checkIndentInArrayOrObjectBlock(node);
        _super.prototype.visitArrayLiteralExpression.call(this, node);
    };
    IndentWalker.prototype.visitSwitchStatement = function (node) {
        var switchIndent = this.getNodeIndent(node).goodChar;
        var caseIndent = this.expectedCaseIndent(node, switchIndent);
        this.checkNodesIndent(node.caseBlock.clauses, caseIndent);
        this.checkLastNodeLineIndent(node, switchIndent);
        _super.prototype.visitSwitchStatement.call(this, node);
    };
    IndentWalker.prototype.visitCaseClause = function (node) {
        this.visitCase(node);
        _super.prototype.visitCaseClause.call(this, node);
    };
    IndentWalker.prototype.visitDefaultClause = function (node) {
        this.visitCase(node);
        _super.prototype.visitDefaultClause.call(this, node);
    };
    IndentWalker.prototype.visitWhileStatement = function (node) {
        this.blockLessNodes(node);
        _super.prototype.visitWhileStatement.call(this, node);
    };
    IndentWalker.prototype.visitForStatement = function (node) {
        this.blockLessNodes(node);
        _super.prototype.visitForStatement.call(this, node);
    };
    IndentWalker.prototype.visitForInStatement = function (node) {
        this.blockLessNodes(node);
        _super.prototype.visitForInStatement.call(this, node);
    };
    IndentWalker.prototype.visitDoStatement = function (node) {
        this.blockLessNodes(node);
        _super.prototype.visitDoStatement.call(this, node);
    };
    IndentWalker.prototype.visitVariableDeclaration = function (node) {
        this.checkIndentInVariableDeclarations(node);
        _super.prototype.visitVariableDeclaration.call(this, node);
    };
    IndentWalker.prototype.visitVariableStatement = function (node) {
        _super.prototype.visitVariableStatement.call(this, node);
        var list = node.getChildAt(0).getChildAt(1);
        if (!list) {
            return;
        }
        var len = list.getChildCount();
        var lastElement = list.getChildAt(len - 1);
        var lastToken = node.getLastToken();
        var lastTokenLine = this.getLine(lastToken, true);
        var lastElementLine = this.getLine(lastElement, true);
        if (lastTokenLine <= lastElementLine) {
            return;
        }
        var tokenBeforeLastElement = list.getChildAt(len - 2);
        if (isKind(tokenBeforeLastElement, 'CommaToken')) {
            this.checkLastNodeLineIndent(node, this.getNodeIndent(tokenBeforeLastElement).goodChar);
        }
        else {
        }
    };
    IndentWalker.prototype.visitFunctionDeclaration = function (node) {
        if (this.isSingleLineNode(node)) {
            return;
        }
        if (OPTIONS.FunctionDeclaration.parameters === 'first' && node.parameters.length) {
            var indent = this.getLineAndCharacter(node.parameters[0]).character;
            this.checkNodesIndent(node.parameters.slice(1), indent);
        }
        else if (OPTIONS.FunctionDeclaration.parameters !== null) {
            this.checkNodesIndent(node.parameters, this.getNodeIndent(node).goodChar + indentSize * OPTIONS.FunctionDeclaration.parameters);
        }
        _super.prototype.visitFunctionDeclaration.call(this, node);
    };
    IndentWalker.prototype.visitFunctionExpression = function (node) {
        if (this.isSingleLineNode(node)) {
            return;
        }
        if (OPTIONS.FunctionExpression.parameters === 'first' && node.parameters.length) {
            var indent = this.getLineAndCharacter(node.parameters[0]).character;
            this.checkNodesIndent(node.parameters.slice(1), indent);
        }
        else if (OPTIONS.FunctionExpression.parameters !== null) {
            this.checkNodesIndent(node.parameters, this.getNodeIndent(node).goodChar + indentSize * OPTIONS.FunctionExpression.parameters);
        }
        _super.prototype.visitFunctionExpression.call(this, node);
    };
    IndentWalker.prototype.visitPropertyAccessExpression = function (node) {
        if (typeof OPTIONS.MemberExpression === 'undefined') {
            return;
        }
        if (this.isSingleLineNode(node)) {
            return;
        }
        if (this.getVariableDeclaratorNode(node)) {
            return;
        }
        var binaryNode = this.getBinaryExpressionNode(node);
        if (binaryNode && this.isAssignment(binaryNode)) {
            return;
        }
        var propertyIndent = this.getNodeIndent(node).goodChar + indentSize * OPTIONS.MemberExpression;
        var dotToken = node.getChildAt(1);
        var checkNodes = [node.name, dotToken];
        this.checkNodesIndent(checkNodes, propertyIndent);
        _super.prototype.visitPropertyAccessExpression.call(this, node);
    };
    IndentWalker.prototype.visitSourceFile = function (node) {
        this.checkNodesIndent(node.statements, 0);
        _super.prototype.visitSourceFile.call(this, node);
    };
    return IndentWalker;
}(Lint.RuleWalker));

//# sourceMappingURL=data:application/json;charset=utf8;base64,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Q0FBQztJQUVTLG9EQUE2QixHQUF2QyxVQUF3QyxJQUFpQztRQUN2RSxFQUFFLENBQUMsQ0FBQyxPQUFPLE9BQU8sQ0FBQyxnQkFBZ0IsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3BELE1BQU0sQ0FBQztRQUNULENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sQ0FBQztRQUNULENBQUM7UUFNRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sQ0FBQztRQUNULENBQUM7UUFFRCxJQUFNLFVBQVUsR0FBd0IsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNFLEVBQUUsQ0FBQyxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoRCxNQUFNLENBQUM7UUFDVCxDQUFDO1FBRUQsSUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEdBQUcsVUFBVSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztRQUlqRyxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BDLElBQU0sVUFBVSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUV6QyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ2xELGdCQUFLLENBQUMsNkJBQTZCLFlBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVTLHNDQUFlLEdBQXpCLFVBQTBCLElBQW1CO1FBRTNDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzFDLGdCQUFLLENBQUMsZUFBZSxZQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFDSCxtQkFBQztBQUFELENBbDFCQSxBQWsxQkMsQ0FsMUIwQixJQUFJLENBQUMsVUFBVSxHQWsxQnpDIiwiZmlsZSI6InJ1bGVzL3RlckluZGVudFJ1bGUuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2ptbG9wZXovV29ya3NwYWNlL3RzbGludC1lc2xpbnQtcnVsZXMvc3JjIn0=
