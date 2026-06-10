'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const RESUME_FILE = 'resume-master.md';

export default function ResumePage() {
  const [resumeContent, setResumeContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadResume();
  }, []);

  const loadResume = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/docs/${RESUME_FILE}`);
      if (!response.ok) throw new Error('Failed to load resume');
      
      const content = await response.text();
      setResumeContent(content);
    } catch (err) {
      setError('Failed to load resume. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const printToPDF = () => {
    if (!resumeContent) return;
    
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) {
      alert('Please allow pop-ups to print the resume');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Resume - Ernesto Monge</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: white;
            padding: 40px;
            max-width: 900px;
            margin: 0 auto;
          }
          
          h1 {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 5px;
            color: #000;
          }
          
          h2 {
            font-size: 16px;
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 10px;
            color: #1f2937;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 5px;
          }
          
          h3 {
            font-size: 14px;
            font-weight: 600;
            margin-top: 12px;
            margin-bottom: 8px;
            color: #2563eb;
          }
          
          p {
            margin-bottom: 8px;
            font-size: 13px;
            line-height: 1.5;
          }
          
          ul, ol {
            margin-left: 20px;
            margin-bottom: 10px;
            font-size: 13px;
          }
          
          li {
            margin-bottom: 6px;
            line-height: 1.5;
          }
          
          strong {
            font-weight: 600;
            color: #000;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 13px;
          }
          
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          
          th {
            background-color: #f3f4f6;
            font-weight: 600;
          }
          
          hr {
            margin: 15px 0;
            border: none;
            border-top: 1px solid #ddd;
          }
          
          @media print {
            body {
              padding: 20px;
            }
            
            h1 {
              page-break-after: avoid;
            }
            
            h2 {
              page-break-after: avoid;
              margin-top: 15px;
            }
            
            h3 {
              page-break-after: avoid;
            }
            
            p, ul, li {
              orphans: 3;
              widows: 3;
            }
          }
        </style>
      </head>
      <body>
        ${resumeContent
          .split('\n')
          .map((line) => {
            if (line.startsWith('# ')) {
              return `<h1>${line.replace('# ', '')}</h1>`;
            } else if (line.startsWith('## ')) {
              return `<h2>${line.replace('## ', '')}</h2>`;
            } else if (line.startsWith('### ')) {
              return `<h3>${line.replace('### ', '')}</h3>`;
            } else if (line.startsWith('- ')) {
              return `<li>${line.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`;
            } else if (line.startsWith('✓ ')) {
              return `<li>✓ ${line.replace('✓ ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`;
            } else if (line.startsWith('|')) {
              return `<tr><td>${line.replace(/\|/g, '</td><td>').slice(5, -5)}</td></tr>`;
            } else if (line.startsWith('---')) {
              return '<hr />';
            } else if (line.trim() === '') {
              return '';
            } else {
              return `<p>${line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')}</p>`;
            }
          })
          .join('\n')}
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="fixed top-0 w-full bg-slate-900/95 backdrop-blur z-40 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-white font-bold text-lg tracking-tight hover:text-primary-400 transition">
            EM<span className="text-primary-400">.</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Resume</h1>
          <button
            onClick={printToPDF}
            disabled={loading || !resumeContent}
            className="bg-primary-600 hover:bg-primary-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-lg transition"
          >
            {loading ? 'Loading...' : 'Download PDF'}
          </button>
        </div>
      </div>

      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-8">
            <div className="max-w-4xl mx-auto">
              {loading ? (
                <div className="text-slate-400 text-center py-12">Loading resume...</div>
              ) : error ? (
                <div className="text-red-400 text-center py-12">{error}</div>
              ) : !resumeContent ? (
                <div className="text-slate-400 text-center py-12">No resume content available</div>
              ) : (
                <div className="space-y-2 text-slate-300">
                  {(() => {
                    const lines = resumeContent.split('\n');
                    const elements: JSX.Element[] = [];
                    let i = 0;
                    
                    const processBold = (text: string) => {
                      const parts = text.split(/\*\*(.*?)\*\*/g);
                      return parts.map((part, idx) =>
                        idx % 2 === 1 ? (
                          <span key={idx} className="font-semibold text-white">{part}</span>
                        ) : (
                          <span key={idx}>{part}</span>
                        )
                      );
                    };
                    
                    const cleanHeading = (text: string) => {
                      return text.replace(/\*\*/g, '');
                    };
                    
                    while (i < lines.length) {
                      const line = lines[i];
                      
                      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
                        const tableRows: string[] = [];
                        while (i < lines.length && lines[i].trim().startsWith('|')) {
                          tableRows.push(lines[i]);
                          i++;
                        }
                        
                        const headerRow = tableRows[0];
                        const bodyRows = tableRows.slice(2);
                        
                        const parseRow = (row: string) => {
                          return row.split('|').slice(1, -1).map(cell => cell.trim());
                        };
                        
                        const headers = parseRow(headerRow);
                        
                        elements.push(
                          <div key={`table-${i}`} className="overflow-x-auto my-4">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-slate-600">
                                  {headers.map((header, idx) => (
                                    <th key={idx} className="text-left py-2 px-3 text-white font-semibold">
                                      {cleanHeading(header)}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {bodyRows.map((row, rowIdx) => {
                                  const cells = parseRow(row);
                                  return (
                                    <tr key={rowIdx} className="border-b border-slate-700/50">
                                      {cells.map((cell, cellIdx) => (
                                        <td key={cellIdx} className={`py-2 px-3 ${cellIdx === 0 ? 'text-blue-300 font-medium' : 'text-slate-300'}`}>
                                          {cleanHeading(cell)}
                                        </td>
                                      ))}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        );
                        continue;
                      }
                      
                      if (line.startsWith('# ')) {
                        elements.push(
                          <h1 key={i} className="text-4xl font-bold text-white mt-8 mb-4">
                            {cleanHeading(line.replace('# ', ''))}
                          </h1>
                        );
                      } else if (line.startsWith('## ')) {
                        elements.push(
                          <h2 key={i} className="text-2xl font-bold text-white mt-6 mb-3 border-b border-slate-600 pb-2">
                            {cleanHeading(line.replace('## ', ''))}
                          </h2>
                        );
                      } else if (line.startsWith('### ')) {
                        elements.push(
                          <h3 key={i} className="text-lg font-semibold text-blue-300 mt-4 mb-2">
                            {cleanHeading(line.replace('### ', ''))}
                          </h3>
                        );
                      } else if (line.startsWith('#### ')) {
                        elements.push(
                          <h4 key={i} className="text-base font-semibold text-blue-200 mt-3 mb-2">
                            {cleanHeading(line.replace('#### ', ''))}
                          </h4>
                        );
                      } else if (line.startsWith('✓ ')) {
                        elements.push(
                          <div key={i} className="ml-4 py-1 text-slate-300 flex items-start">
                            <span className="text-green-400 mr-3 flex-shrink-0">✓</span>
                            <span>{processBold(line.replace('✓ ', ''))}</span>
                          </div>
                        );
                      } else if (line.startsWith('- ')) {
                        elements.push(
                          <div key={i} className="ml-4 py-1 text-slate-300 flex items-start">
                            <span className="text-blue-400 mr-3 flex-shrink-0">•</span>
                            <span>{processBold(line.replace('- ', ''))}</span>
                          </div>
                        );
                      } else if (line.startsWith('---')) {
                        elements.push(<hr key={i} className="my-6 border-slate-600" />);
                      } else if (line.trim() === '') {
                        elements.push(<div key={i} className="py-1" />);
                      } else {
                        elements.push(
                          <p key={i} className="py-1 leading-relaxed">
                            {processBold(line)}
                          </p>
                        );
                      }
                      
                      i++;
                    }
                    
                    return elements;
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
