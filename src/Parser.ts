/*
    PyDoctestBtn
    Parser Class
    © 2021 Noah Synowiec - noahsyn1@gmail.com
*/

import {ConfigHandler} from './ConfigHandler';
import { exec } from 'child_process';
import * as vscode from 'vscode';

export class Parser {

    config;

    constructor () {
        this.config = new ConfigHandler;
    }

    // Detect doctests.
    countDoctests(textEditor: vscode.TextEditor) {
        /*
            Searches the given document for valid doctests.
            Returns the number of valid docstrings and doctests in the active file.
        */
        var tripleDoubleQuotes = 0; 
        var tripleSingleQuotes = 0; 
        var totalDocstrings = 0;
        var totaldocTests = 0;
    
        const doc = textEditor.document;
    
        for (var i = 0; i < doc.lineCount; i++) {											// Iterate through each line of text in the active doc
            const line = doc.lineAt(i);		
    
            if (!line.isEmptyOrWhitespace) {												// Ignore if whitespace
                const txtIndex = line.firstNonWhitespaceCharacterIndex;	
                const text = line.text.slice(txtIndex);										// Ignore whitespace up to first character
    
                if (text.slice(0,3) === '"""' && tripleSingleQuotes % 2 === 0) {			// Count """ if not in ''' docstring
                    tripleDoubleQuotes++;
    
                } else if (text.slice(0,3) === "'''" && tripleDoubleQuotes % 2 === 0) {		// Count ''' if not in """ docstring
                    tripleSingleQuotes++;
    
                } else if (text.slice(0, 4) === ">>> " && text.trim().length > 4 && 		// Count >>> if followed by a space and a 
                          (tripleSingleQuotes % 2 === 1 || tripleDoubleQuotes % 2 === 1)) {	// character and inside a """ or ''' docstring.
                    totaldocTests++;														
                }
            }
        }
        totalDocstrings = ~~(tripleDoubleQuotes / 2) + ~~(tripleSingleQuotes / 2);			// Total docstrings = sum of floor division of total ''' and """ instances
    
        return {
            "totalDocstrings": totalDocstrings,
            "totalDoctests": totaldocTests
        };
    }

    doctestLinter(textEditor: vscode.TextDocument) {
        /*
            Executes doctest silently and parses output.
        */
        const paths = this.config.getPaths();
        const execCommand = paths.python + " -m " + paths.doctest + " -v " + paths.file;
        var failed = false;
    
        exec(execCommand, (err, stdout, stderr) => {
            if (err) {
                console.log("Error: err tripped");
            }
          
            // the *entire* stdout and stderr (buffered)
            const summary = stdout.split('\n').slice(-6,-1);
            for (var i = 0; i < summary.length; i++) {
                console.log(summary[i]);
            }
    
            if (summary[4][1] === '*') {
                failed = true;
            }
        });
    }
}