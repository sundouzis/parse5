'use strict';

var assert = require('assert'),
    Tokenizer = require('../../lib/tokenizer');

exports['Location info (Tokenizer)'] = function () {
    var testCases = [
        {
            initialMode: Tokenizer.MODE.DATA,
            lastStartTagName: '',
            htmlChunks: [
                '\r\n', '<!DOCTYPE html>', '\n',
                '<!-- Test -->', '\n',
                '<head>',
                '\n   ', '<meta charset="utf-8">', '<title>', '   ', 'node.js', '\u0000', '</title>', '\n',
                '</head>', '\n',
                '<body id="front">', '\n',
                '<div id="intro">',
                '\n   ', '<p>',
                '\n       ', 'Node.js', ' ', 'is', ' ', 'a',
                '\n       ', 'platform', ' ', 'built', ' ', 'on',
                '\n       ', '<a href="http://code.google.com/p/v8/">',
                '\n       ', 'Chrome\'s', ' ', 'JavaScript', ' ', 'runtime',
                '\n       ', '</a>', '\n',
                '</div>',
                '<body>'
            ]
        },
        {
            initialMode: Tokenizer.MODE.RCDATA,
            lastStartTagName: 'title',
            htmlChunks: [
                '<div>Test',
                ' \n   ', 'hey', ' ', 'ya!', '</title>', '<!--Yo-->'
            ]
        },
        {
            initialMode: Tokenizer.MODE.RAWTEXT,
            lastStartTagName: 'style',
            htmlChunks: [
                '.header{', ' \n   ', 'color:red;', '\n', '}', '</style>', 'Some', ' ', 'text'
            ]
        },
        {
            initialMode: Tokenizer.MODE.SCRIPT_DATA,
            lastStartTagName: 'script',
            htmlChunks: [
                'var', ' ', 'a=c', ' ', '-', ' ', 'd;', '\n', 'a<--d;', '</script>', '<div>'
            ]
        },
        {
            initialMode: Tokenizer.MODE.PLAINTEXT,
            lastStartTagName: 'plaintext',
            htmlChunks: [
                'Text', ' \n', 'Test</plaintext><div>'
            ]
        }

    ];

    testCases.forEach(function (testCase) {
        var html = testCase.htmlChunks.join(''),
            tokenizer = new Tokenizer({locationInfo: true}),
            lastChunkIdx = testCase.htmlChunks.length - 1;

        for (var i = 0; i < testCase.htmlChunks.length; i++)
            tokenizer.write(testCase.htmlChunks[i], i === lastChunkIdx);

        tokenizer.state = testCase.initialMode;
        tokenizer.lastStartTagName = testCase.lastStartTagName;

        for (var token = tokenizer.getNextToken(), j = 0; token.type !== Tokenizer.EOF_TOKEN;) {
            if(token.type === Tokenizer.HIBERNATION_TOKEN)
                continue;

            var chunk = html.substring(token.location.start, token.location.end);

            assert.strictEqual(chunk, testCase.htmlChunks[j]);

            token = tokenizer.getNextToken();
            j++;
        }
    });
};
