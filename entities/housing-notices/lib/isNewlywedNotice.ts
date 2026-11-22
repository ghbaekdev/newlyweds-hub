const NEWLYWED_NOTICE = /신혼|신생아|예비부부/;

export function isNewlywedNotice(title: string) {
  return NEWLYWED_NOTICE.test(title);
}
