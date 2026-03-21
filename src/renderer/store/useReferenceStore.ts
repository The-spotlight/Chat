import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { ModelMessage, MessageReference } from "../../model/ModelMessage";

export interface ReferenceState {
    message: ModelMessage | null;
}

export const useReferenceStore = defineStore('reference', () => {
    const currentReference = ref<ModelMessage | null>(null);

    const hasReference = computed(() => currentReference.value !== null);

    const referenceInfo = computed(() => {
        if (!currentReference.value) return null;
        return {
            messageId: currentReference.value.id!,
            fromName: currentReference.value.fromName || '',
            content: truncateContent(currentReference.value.messageContent || '', 30)
        };
    });

    const setReference = (message: ModelMessage) => {
        currentReference.value = message;
    };

    const clearReference = () => {
        currentReference.value = null;
    };

    const createReferenceData = (): MessageReference | null => {
        if (!currentReference.value) return null;
        return {
            messageId: currentReference.value.id!,
            fromName: currentReference.value.fromName || '',
            content: truncateContent(currentReference.value.messageContent || '', 50)
        };
    };

    const truncateContent = (content: string, maxLength: number): string => {
        if (content.length <= maxLength) return content;
        return content.slice(0, maxLength) + '...';
    };

    return {
        currentReference,
        hasReference,
        referenceInfo,
        setReference,
        clearReference,
        createReferenceData,
        truncateContent
    };
});
