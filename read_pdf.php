<?php
require 'vendor/autoload.php';

use Smalot\PdfParser\Parser;

$parser = new Parser();
$pdf = $parser->parseFile('Backend project pergudangan.pdf');
$text = $pdf->getText();
file_put_contents('pdf_content.txt', $text);
echo "Done! File size: " . strlen($text) . " characters\n";
echo "Saved to pdf_content.txt\n";
