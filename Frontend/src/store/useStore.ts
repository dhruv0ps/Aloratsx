import { useContext } from 'react';
import { MobXProviderContext } from 'mobx-react';

export function useStore() {
    const context = useContext(MobXProviderContext);
    if (context === undefined) {
        throw new Error('useStore must be used within a MobXProvider');
    }
    return context;
}