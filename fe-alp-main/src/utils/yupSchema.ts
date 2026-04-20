import * as yup from "yup";

interface MaxLength {
	groupName: number;
	groupDesc: number;
}
export const maxLength: MaxLength = {
	groupName: 20,
	groupDesc: 50,
};
export const bookmarkSchema = yup.object().shape({
	groupName: yup
		.string()
		.required("폴더명을 입력해주세요.")
		.max(maxLength.groupName, "폴더명은 20자 이내로 입력해주세요."),
	description: yup.string().max(maxLength.groupDesc, "폴더 설명은 50자 이내로 입력해주세요."),
});
