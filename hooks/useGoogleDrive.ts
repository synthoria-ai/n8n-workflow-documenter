import { useState, useEffect } from 'react';

// Types for Google Global Objects
declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}

export interface DriveFolder {
    id: string;
    name: string;
}

export type DriveFile = {
    id: string;
    name: string;
    mimeType: string;
};

const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly';

export function useGoogleDrive() {
    const [tokenClient, setTokenClient] = useState<any>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isGapiLoaded, setIsGapiLoaded] = useState(false);
    const [isGisLoaded, setIsGisLoaded] = useState(false);

    // Load scripts
    useEffect(() => {
        const scriptGapi = document.createElement('script');
        scriptGapi.src = 'https://apis.google.com/js/api.js';
        scriptGapi.onload = () => {
            window.gapi.load('client:picker', async () => {
                await window.gapi.client.init({
                    discoveryDocs: DISCOVERY_DOCS,
                });
                setIsGapiLoaded(true);
            });
        };
        document.body.appendChild(scriptGapi);

        const scriptGis = document.createElement('script');
        scriptGis.src = 'https://accounts.google.com/gsi/client';
        scriptGis.onload = () => setIsGisLoaded(true);
        document.body.appendChild(scriptGis);

        return () => {
            document.body.removeChild(scriptGapi);
            document.body.removeChild(scriptGis);
        };
    }, []);

    // Initialize Token Client
    const initTokenClient = (clientId: string) => {
        if (!isGisLoaded) return;

        const client = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: SCOPES,
            callback: (tokenResponse: any) => {
                if (tokenResponse && tokenResponse.access_token) {
                    setAccessToken(tokenResponse.access_token);
                }
            },
        });
        setTokenClient(client);
    };

    const login = () => {
        if (tokenClient) {
            tokenClient.requestAccessToken();
        } else {
            console.error("Token Client not initialized. Provide Client ID first.");
        }
    };

    // Helper to pick a folder using Google Picker API
    const pickFolder = (clientId: string): Promise<DriveFolder | null> => {
        return new Promise((resolve, reject) => {
            if (!isGapiLoaded || !accessToken) {
                reject("Google API not ready or not logged in");
                return;
            }

            const view = new window.google.picker.DocsView(window.google.picker.ViewId.FOLDERS)
                .setSelectFolderEnabled(true)
                .setMimeTypes('application/vnd.google-apps.folder');

            const picker = new window.google.picker.PickerBuilder()
                .setDeveloperKey("YOUR_API_KEY_IF_NEEDED_BUT_ACCESS_TOKEN_IS_ENOUGH_USUALLY_NO_WAIT_PICKER_NEEDS_DEV_KEY")
                // Picker actually requires a Developer Key (API Key) distinct from OAuth token sometimes, 
                // OR just strict OAuth. We'll assume the user might need to input an API Key for Picker specifically or we try without.
                // Actually we can pass the accessToken.
                .setOAuthToken(accessToken)
                .addView(view)
                .setCallback((data: any) => {
                    if (data.action === window.google.picker.Action.PICKED) {
                        const doc = data.docs[0];
                        resolve({ id: doc.id, name: doc.name });
                    } else if (data.action === window.google.picker.Action.CANCEL) {
                        resolve(null);
                    }
                })
                .build();

            picker.setVisible(true);
        });
    };

    // File Operations
    const listJsonFiles = async (folderId: string): Promise<DriveFile[]> => {
        if (!accessToken) return [];

        // Using gapi client
        try {
            const response = await window.gapi.client.drive.files.list({
                q: `'${folderId}' in parents and mimeType = 'application/json' and trashed = false`,
                fields: 'files(id, name, mimeType)',
                pageSize: 100,
            });
            return response.result.files || [];
        } catch (err) {
            console.error("List files failed", err);
            return [];
        }
    };

    const getFileContent = async (fileId: string): Promise<string> => {
        // Need to use fetch for content with alt=media, gapi list doesn't return body
        const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return await response.text();
    };

    const uploadFile = async (name: string, content: string, parentId: string, mimeType: string) => {
        const metadata = {
            name,
            parents: [parentId],
            mimeType,
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', new Blob([content], { type: mimeType }));

        await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}` },
            body: form,
        });
    };

    return {
        isReady: isGapiLoaded && isGisLoaded,
        isAuthenticated: !!accessToken,
        initTokenClient,
        login,
        pickFolder,
        listJsonFiles,
        getFileContent,
        uploadFile
    };
}
