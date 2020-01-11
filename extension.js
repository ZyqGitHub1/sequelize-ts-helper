const vscode = require("vscode");
const _ = require("lodash");
const generateBelongsToCode = require("./generator/generateBelongsToCode");
const generateBelongsToManyCode = require("./generator/generateBelongsToManyCode");
const generateHasManyCode = require("./generator/generateHasManyCode");
const generateHasOneCode = require("./generator/generateHasOneCode");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */

// const associationTypes = ["BelongsToMany", "BelongsTo", "HasMany", "HasOne"];

const associationActionMap = {
  BelongsToMany: generateBelongsToManyCode,
  BelongsTo: generateBelongsToCode,
  HasMany: generateHasManyCode,
  HasOne: generateHasOneCode
};

function activate(context) {
  console.log('Congratulations, your extension "sequelize-ts-helper" is now active!');
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("extension.generate-mixin-field", function() {
    // The code you place here will be executed every time your command is executed
    var editor = vscode.window.activeTextEditor;
    if (!editor) return; // No open text editor

    var selection = editor.selection;
    var text = editor.document.getText(selection);

    if (text.length < 1) {
      vscode.window.showErrorMessage("No selected properties.");
      return;
    }
    try {
      const associationType = getAssociationType(text);
      if (!Object.keys(associationActionMap).includes(associationType)) {
        vscode.window.showErrorMessage("选择字段不是sequelize关联字段");
        return;
      }
      const fieldWord = getFieldWord(text);
      const associationClass = getAssociationClass(text);
      const associationAction = _.get(associationActionMap, associationType);
      const code = associationAction(fieldWord, associationClass);

      editor.edit(edit => {
        editor.selections.forEach(selection => {
          edit.insert(selection.end, code);
        });
      });

      // format mixin fields
      vscode.commands.executeCommand("editor.action.formatSelection");
    } catch (error) {
      console.error(error);
      vscode.window.showErrorMessage("运行异常");
    }

    // Display a message box to the user
    // vscode.window.showInformationMessage("Hello World!");
  });

  context.subscriptions.push(disposable);
}

function getAssociationType(str) {
  const associationRegx = /\s*@([a-zA-Z0-9]+)([\s\S]+)/;
  const associationWord = str.match(associationRegx)[1];
  return associationWord;
}

function getFieldWord(str) {
  const fieldRegx = /([\s\S]+)as:(\s+)'([a-zA-Z0-9]+)'([\s\S]+)/;
  const fieldWord = str.match(fieldRegx)[3];
  return fieldWord;
}

function getAssociationClass(str) {
  const associationClassRegx = /([\s\S]+)=>(\s+)([a-zA-Z0-9]+)([\s\S]+)/;
  const associationClass = str.match(associationClassRegx)[3];
  return associationClass;
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate
};
