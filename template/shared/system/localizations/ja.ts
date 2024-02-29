import { Dictionary } from ".";

const ja: Dictionary = {
    signIn : {
        menu : "サインイン"
        , title : "サインイン"
        , buttons: {
            signIn: "サインイン"
        }
    }
    , signUp : {
        menu : "サインアップ"
        , title: "サインアップ"
        , buttons: {
            signUp: "サインアップ"
        }
    }, signOut : {
        menu : "Sign Out"
        , title : "Sign Out"
        , buttons: {
            signOut: "Sign Out"
        }
    }
    , common : {
        labels : {
            mailAddress: "メールアドレス"
            , password: "パスワード"
        }
        , validations : {
            isRequired: (what: string) => `${ what } は必須です`
            , isMalformed: (what: string) => `正しい ${ what } の形式ではありません`
            , isTooShort: (what: string, minLength: number) => `${ what } が短すぎます。${minLength} 文字以上が必要です。`
            , isTooLong: (what: string, maxLength: number) => `${ what } が長すぎます。${maxLength} 文字以下にして下さい。`
        }
    }
};

export default ja;