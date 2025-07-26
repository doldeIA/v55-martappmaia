
import React, { useState, useEffect } from 'react';
import { filesDB } from '../services/dbService';

interface PersistentImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src?: string;
}

export const PersistentImage: React.FC<PersistentImageProps> = ({ src, ...props }) => {
    const [resolvedSrc, setResolvedSrc] = useState<string | undefined>(undefined);

    useEffect(() => {
        let objectUrl: string | null = null;
        let isMounted = true;
        
        // When src changes, reset resolvedSrc to show loading state
        setResolvedSrc(undefined);

        const resolveSrc = async () => {
            if (src && src.startsWith('indexeddb:')) {
                try {
                    const blob = await filesDB.get<Blob>(src);
                    if (isMounted) {
                        if (blob) {
                            objectUrl = URL.createObjectURL(blob);
                            setResolvedSrc(objectUrl);
                        } else {
                            // Fallback image if not found in DB
                            setResolvedSrc('https://via.placeholder.com/150?text=Not+Found'); 
                        }
                    }
                } catch (error) {
                    console.error("Erro ao resolver imagem do IndexedDB:", error);
                    if (isMounted) {
                        setResolvedSrc('https://via.placeholder.com/150?text=Load+Error');
                    }
                }
            } else {
                if (isMounted) {
                   setResolvedSrc(src);
                }
            }
        };

        resolveSrc();

        return () => {
            isMounted = false;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [src]);

    // Render a placeholder with a pulse animation while the image is loading
    if (resolvedSrc === undefined) {
        const { width, height, className } = props;
        return <div className={`bg-white/5 animate-pulse ${className}`} style={{ width, height }}></div>;
    }
    
    return <img src={resolvedSrc} {...props} />;
};
