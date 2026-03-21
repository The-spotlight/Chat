import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useReferenceStore } from '../useReferenceStore';
import { ModelMessage } from '../../../model/ModelMessage';

describe('useReferenceStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('setReference', () => {
        it('should update state correctly when setting reference message', () => {
            const store = useReferenceStore();
            const message = new ModelMessage();
            message.id = 'msg-123';
            message.fromName = '张三';
            message.messageContent = '这是一条测试消息';

            expect(store.hasReference).toBe(false);
            expect(store.currentReference).toBeNull();

            store.setReference(message);

            expect(store.hasReference).toBe(true);
            expect(store.currentReference).toEqual(message);
            expect(store.referenceInfo).toEqual({
                messageId: 'msg-123',
                fromName: '张三',
                content: '这是一条测试消息'
            });
        });
    });

    describe('clearReference', () => {
        it('should reset state to empty when clearing reference message', () => {
            const store = useReferenceStore();
            const message = new ModelMessage();
            message.id = 'msg-123';
            message.fromName = '张三';
            message.messageContent = '这是一条测试消息';

            store.setReference(message);
            expect(store.hasReference).toBe(true);

            store.clearReference();

            expect(store.hasReference).toBe(false);
            expect(store.currentReference).toBeNull();
            expect(store.referenceInfo).toBeNull();
        });
    });

    describe('createReferenceData', () => {
        it('should include correct reference fields when creating reference data', () => {
            const store = useReferenceStore();
            const message = new ModelMessage();
            message.id = 'msg-456';
            message.fromName = '李四';
            message.messageContent = '被引用的消息内容';

            store.setReference(message);
            const referenceData = store.createReferenceData();

            expect(referenceData).toEqual({
                messageId: 'msg-456',
                fromName: '李四',
                content: '被引用的消息内容'
            });
        });

        it('should return null when no reference message exists', () => {
            const store = useReferenceStore();
            const referenceData = store.createReferenceData();

            expect(referenceData).toBeNull();
        });

        it('should truncate content correctly when message exceeds 50 characters', () => {
            const store = useReferenceStore();
            const message = new ModelMessage();
            message.id = 'msg-789';
            message.fromName = '王五';
            // Create a message longer than 50 characters
            const longContent = 'a'.repeat(60);
            message.messageContent = longContent;

            store.setReference(message);
            const referenceData = store.createReferenceData();

            // Verify truncated length is 50 + 3(ellipsis) = 53
            expect(referenceData?.content.length).toBe(53);
            expect(referenceData?.content.endsWith('...')).toBe(true);
            expect(referenceData?.content.slice(0, 50)).toBe('a'.repeat(50));
        });
    });

    describe('truncateContent', () => {
        it('should not truncate when content is within limit', () => {
            const store = useReferenceStore();
            const content = '短消息';

            const result = store.truncateContent(content, 30);

            expect(result).toBe('短消息');
        });

        it('should truncate and add ellipsis when content exceeds limit', () => {
            const store = useReferenceStore();
            // Create content longer than 30 characters
            const content = 'b'.repeat(40);

            const result = store.truncateContent(content, 30);

            // Verify truncated length is 30 + 3(ellipsis) = 33
            expect(result.length).toBe(33);
            expect(result.endsWith('...')).toBe(true);
            expect(result.slice(0, 30)).toBe('b'.repeat(30));
        });
    });

    describe('referenceInfo content truncation', () => {
        it('should limit preview summary to 30 characters in input box', () => {
            const store = useReferenceStore();
            const message = new ModelMessage();
            message.id = 'msg-001';
            message.fromName = '赵六';
            // Create a message longer than 30 characters
            message.messageContent = 'c'.repeat(50);

            store.setReference(message);

            // Verify truncated length is 30 + 3(ellipsis) = 33
            expect(store.referenceInfo?.content.length).toBe(33);
            expect(store.referenceInfo?.content.endsWith('...')).toBe(true);
            expect(store.referenceInfo?.content.slice(0, 30)).toBe('c'.repeat(30));
        });
    });
});
