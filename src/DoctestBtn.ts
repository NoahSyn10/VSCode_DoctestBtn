/*
    PyDoctestBtn
    DoctestBtn Class
    © 2021 Noah Synowiec - noahsyn1@gmail.com
*/

import { ConfigHandler } from './ConfigHandler';
import { Parser } from './Parser';
import { TerminalHandler } from './TerminalHandler';
import { Utils } from './Utils';
import * as vscode from 'vscode';

export class DoctestBtn {
    /*
        An class containing methods that are triggered by the extension's event listeners.
        This class combines the functionality of all other classes to make the DoctestBtn extension.
    */

    config;
    parser;
    terminalHandler;
    utils;

    constructor () {
        this.config = new ConfigHandler;
        this.parser = new Parser;
        this.terminalHandler = new TerminalHandler;
        this.utils = new Utils;
    }

    execDoctest() {
        /*
            Excecutes the doctest command in the main terminal.
        */
        let terminal = this.terminalHandler.getMainTerminal();
        let doctestCommand = this.config.getDoctestCommand();
        this.terminalHandler.executeInTerminal(terminal, doctestCommand);

        this.utils.dualLog("> Executing Doctest...");
    }

    doctestHandler(activeEditor: vscode.TextEditor | undefined, docChange?: vscode.TextDocumentChangeEvent): void {
        /*
            Get data on doctests in file and update menu and status bar accordingly.
        */
        if ((docChange && docChange?.document.fileName !== activeEditor?.document.fileName) || activeEditor?.document.languageId !== "python") {
            return;																				// Check if change was in the active editor & if the editor is a .py file
        }
        
        this.utils.dualLog("> Scanning file for doctests...");

        const docData = this.parser.countDoctests(activeEditor);
    
        if (docData?.totalDoctests > 0) {			
            this.utils.dualLog("> " + docData.totalDoctests + " doctests found.");											// If there are doctests, show button and status bar items.                                                       
            this.config.showDoctestBtn(docData.totalDoctests);
    
        } else {																				// If there are none, hide the button and status bar items.            
            this.utils.dualLog("> No doctests found.");
            this.config.hideDoctestBtn();
        }
    }

    linter(textEditor: vscode.TextDocument) {
        this.parser.doctestLinter(textEditor);
    }
}