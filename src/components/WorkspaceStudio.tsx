import React, { useState, useEffect } from 'react';
import { FileText, HardDrive, LogOut, Loader2, Search, Trash2, FileSpreadsheet, Send, X } from 'lucide-react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, logout } from '../lib/firebase';
import { MissionResult } from '../types';

interface WorkspaceStudioProps {
  onLogEvent: (level: 'info' | 'warn' | 'error' | 'success' | 'agent' | 'tool', message: string, source?: string) => void;
  speak: (text: string) => void;
  missionResult?: MissionResult | null;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  owners?: { displayName: string; emailAddress: string }[];
}

export const WorkspaceStudio: React.FC<WorkspaceStudioProps> = ({ onLogEvent, speak, missionResult }) => {
  const [needsAuth, setNeedsAuth] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedFileType, setSelectedFileType] = useState<'doc' | 'sheet' | null>(null);
  const [docContent, setDocContent] = useState<string>('');
  const [sheetContent, setSheetContent] = useState<string[][]>([]);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setNeedsAuth(false);
        setUser(user);
        setToken(token);
        onLogEvent('success', 'Google Workspace Authentication Verified', 'workspace');
      },
      () => {
        setNeedsAuth(true);
        setToken(null);
        setUser(null);
      }
    );
    return () => unsubscribe();
  }, [onLogEvent]);

  useEffect(() => {
    if (token) {
      fetchDriveFiles();
    }
  }, [token]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    onLogEvent('info', 'Initiating Google Workspace Auth flow...', 'workspace');
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err: any) {
      onLogEvent('error', `Workspace Auth failed: ${err.message}`, 'workspace');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setNeedsAuth(true);
    setToken(null);
    setUser(null);
    setFiles([]);
    setSelectedFileId(null);
    setSelectedFileType(null);
    setDocContent('');
    setSheetContent([]);
    onLogEvent('info', 'Logged out of Google Workspace.', 'workspace');
  };

  const fetchDriveFiles = async () => {
    if (!token) return;
    setIsLoadingFiles(true);
    onLogEvent('tool', 'Fetching Google Drive documents...', 'workspace');
    try {
      // Get Google Docs and Sheets with metadata
      const res = await fetch('https://www.googleapis.com/drive/v3/files?q=mimeType="application/vnd.google-apps.document" or mimeType="application/vnd.google-apps.spreadsheet"&orderBy=modifiedTime desc&pageSize=15&fields=files(id,name,mimeType,modifiedTime,owners)', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch Drive files');
      const data = await res.json();
      setFiles(data.files || []);
      onLogEvent('success', `Fetched ${data.files?.length || 0} documents from Drive.`, 'workspace');
    } catch (err: any) {
      onLogEvent('error', `Drive API Error: ${err.message}`, 'workspace');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSelectFile = async (file: DriveFile) => {
    if (!token) return;
    setSelectedFileId(file.id);
    const isSheet = file.mimeType === 'application/vnd.google-apps.spreadsheet';
    setSelectedFileType(isSheet ? 'sheet' : 'doc');
    setIsLoadingDoc(true);
    onLogEvent('tool', `Reading ${isSheet ? 'Google Sheet' : 'Google Doc'}: ${file.name}`, 'workspace');
    
    try {
      if (isSheet) {
        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${file.id}?includeGridData=true`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to read Google Sheet');
        const sheetData = await res.json();
        
        let rows: string[][] = [];
        if (sheetData.sheets && sheetData.sheets.length > 0) {
          const firstSheet = sheetData.sheets[0];
          if (firstSheet.data && firstSheet.data.length > 0 && firstSheet.data[0].rowData) {
             const rowData = firstSheet.data[0].rowData;
             rows = rowData.map((row: any) => {
               if (!row.values) return [];
               return row.values.map((col: any) => col.formattedValue || '');
             });
          }
        }
        setSheetContent(rows);
        onLogEvent('success', `Spreadsheet "${file.name}" read successfully.`, 'workspace');
      } else {
        const res = await fetch(`https://docs.googleapis.com/v1/documents/${file.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to read Google Doc');
        const doc = await res.json();
        
        let text = '';
        if (doc.body?.content) {
          doc.body.content.forEach((el: any) => {
            if (el.paragraph?.elements) {
              el.paragraph.elements.forEach((elem: any) => {
                if (elem.textRun?.content) {
                  text += elem.textRun.content;
                }
              });
            }
          });
        }
        
        setDocContent(text || 'No text content found.');
        onLogEvent('success', `Document "${file.name}" read successfully.`, 'workspace');
      }
    } catch (err: any) {
      onLogEvent('error', `API Error: ${err.message}`, 'workspace');
      setDocContent('Error reading content.');
      setSheetContent([]);
    } finally {
      setIsLoadingDoc(false);
    }
  };

  const handleDeleteFile = async (file: DriveFile, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `Are you sure you want to move "${file.name}" to the trash? This action cannot be undone here.`
    );
    if (!confirmed) return;

    if (!token) return;
    onLogEvent('tool', `Moving "${file.name}" to trash...`, 'workspace');
    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete file');
      
      onLogEvent('success', `Moved "${file.name}" to trash.`, 'workspace');
      if (selectedFileId === file.id) {
        setSelectedFileId(null);
        setSelectedFileType(null);
        setDocContent('');
        setSheetContent([]);
      }
      fetchDriveFiles(); // Refresh list
    } catch (err: any) {
      onLogEvent('error', `Delete API Error: ${err.message}`, 'workspace');
    }
  };

  const handleExportDeliverable = async () => {
    if (!token || !missionResult?.deliverable) return;
    
    setIsExporting(true);
    onLogEvent('tool', 'Creating new Google Document for export...', 'workspace');
    
    try {
      // 1. Create the blank document
      const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: missionResult.deliverable.title || 'Mission Deliverable'
        })
      });
      
      if (!createRes.ok) throw new Error('Failed to create document');
      const newDoc = await createRes.json();
      
      onLogEvent('info', 'Document created. Populating content...', 'workspace');
      
      // 2. Insert the deliverable text
      const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${newDoc.documentId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: missionResult.deliverable.content || ''
              }
            }
          ]
        })
      });
      
      if (!updateRes.ok) throw new Error('Failed to write content to document');
      
      onLogEvent('success', 'Deliverable successfully exported to Google Docs.', 'workspace');
      
      // 3. Refresh file list and auto-select
      await fetchDriveFiles();
      handleSelectFile({
        id: newDoc.documentId,
        name: newDoc.title,
        mimeType: 'application/vnd.google-apps.document'
      });
      
    } catch (err: any) {
      onLogEvent('error', `Export Error: ${err.message}`, 'workspace');
    } finally {
      setIsExporting(false);
    }
  };

  if (needsAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] border border-slate-800 rounded-xl bg-slate-900/50">
        <HardDrive className="w-16 h-16 text-cyan-500 mb-6" />
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Connect Google Workspace</h2>
        <p className="text-slate-400 mb-8 max-w-md text-center">
          Authenticate with Google to allow EVE PRIME to access and manage your Google Drive files and read Google Docs.
        </p>
        <button 
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="gsi-material-button bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded shadow-sm border border-gray-300 flex items-center transition-colors disabled:opacity-50"
        >
          {isLoggingIn ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <div className="w-5 h-5 mr-3 flex-shrink-0">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
            </div>
          )}
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px]">
      {/* Sidebar: File List */}
      <div className="col-span-4 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-cyan-500" />
            <h3 className="text-slate-200 font-semibold">My Drive</h3>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-3 border-b border-slate-800 flex items-center gap-2 bg-slate-900/50">
          <Search className="w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search recent files..." 
            className="bg-transparent border-none text-sm text-slate-300 w-full focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoadingFiles ? (
            <div className="flex justify-center p-6">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
            </div>
          ) : files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
            files
              .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(file => {
              const isSheet = file.mimeType === 'application/vnd.google-apps.spreadsheet';
              const isSelected = selectedFileId === file.id;
              
              return (
                <div 
                  key={file.id} 
                  onClick={() => setPreviewFile(file)}
                  className={`p-3 rounded-lg flex items-start gap-3 cursor-pointer group transition-colors ${isSelected ? 'bg-cyan-900/30 border border-cyan-800/50' : 'hover:bg-slate-800 border border-transparent'}`}
                >
                  {isSheet ? (
                    <FileSpreadsheet className={`w-5 h-5 mt-0.5 ${isSelected ? 'text-green-400' : 'text-green-500'}`} />
                  ) : (
                    <FileText className={`w-5 h-5 mt-0.5 ${isSelected ? 'text-cyan-400' : 'text-blue-400'}`} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${isSelected ? 'text-cyan-100' : 'text-slate-300'}`}>
                      {file.name}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteFile(file, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-all rounded hover:bg-slate-700"
                    title="Move to trash"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="text-center p-6 text-sm text-slate-500">
              No documents found.
            </div>
          )}
        </div>
      </div>

      {/* Main Area: Document Viewer */}
      <div className="col-span-8 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
          <h3 className="text-slate-200 font-semibold flex items-center gap-2">
            {selectedFileType === 'sheet' ? (
              <FileSpreadsheet className="w-5 h-5 text-green-400" />
            ) : (
              <FileText className="w-5 h-5 text-blue-400" />
            )}
            {files.find(f => f.id === selectedFileId)?.name || 'Document Viewer'}
          </h3>
          <div className="text-xs text-slate-500 flex items-center gap-4">
            {missionResult?.deliverable && (
              <button
                onClick={handleExportDeliverable}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-900/40 text-cyan-400 hover:bg-cyan-800/60 rounded border border-cyan-800/50 transition-colors disabled:opacity-50"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Export Mission Deliverable
              </button>
            )}
            Google Workspace Integration
          </div>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto bg-slate-100 text-slate-900 rounded-b-xl">
          {isLoadingDoc ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-600 mb-4" />
              <p>Reading file content from Google Workspace...</p>
            </div>
          ) : selectedFileId ? (
            selectedFileType === 'sheet' ? (
              <div className="max-w-full overflow-x-auto bg-white p-4 shadow-sm min-h-full">
                {sheetContent.length > 0 ? (
                  <table className="min-w-full border-collapse">
                    <tbody>
                      {sheetContent.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-slate-200 last:border-0">
                          {row.map((cell, cellIndex) => (
                            <td 
                              key={cellIndex} 
                              className="px-4 py-2 border-r border-slate-200 last:border-0 text-sm whitespace-nowrap"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-slate-500 text-center p-8">Spreadsheet is empty or could not be read.</div>
                )}
              </div>
            ) : (
              <div className="max-w-3xl mx-auto bg-white p-8 min-h-full shadow-sm whitespace-pre-wrap font-serif">
                {docContent}
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
              <FileText className="w-16 h-16 text-slate-300" />
              <p>Select a Google Doc or Sheet from your Drive to view its contents.</p>
            </div>
          )}
        </div>
      </div>
    </div>
    
    {previewFile && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
            <h3 className="text-slate-200 font-semibold flex items-center gap-2">
              {previewFile.mimeType === 'application/vnd.google-apps.spreadsheet' ? (
                <FileSpreadsheet className="w-5 h-5 text-green-400" />
              ) : (
                <FileText className="w-5 h-5 text-blue-400" />
              )}
              File Details
            </h3>
            <button onClick={() => setPreviewFile(null)} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-4 text-slate-300">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Name</p>
              <p className="font-medium text-slate-200 break-words">{previewFile.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Owner</p>
              <p>{previewFile.owners?.[0]?.displayName || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Last Modified</p>
              <p>{previewFile.modifiedTime ? new Date(previewFile.modifiedTime).toLocaleString() : 'Unknown'}</p>
            </div>
          </div>
          <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-3">
            <button 
              onClick={() => setPreviewFile(null)} 
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Close
            </button>
            <button 
              onClick={() => {
                handleSelectFile(previewFile);
                setPreviewFile(null);
              }} 
              className="px-4 py-2 text-sm bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors"
            >
              Open in Viewer
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
