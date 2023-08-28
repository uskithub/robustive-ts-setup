export const SignedInUser = {
    signOut : {
        basics : {
            userStartsSignOutProcess: "ユーザはサインアウトを開始する"
            , serviceClosesSession: "サービスはセッションを終了する"
        }
        , alternatives : {
            userResignSignOut: "ユーザはサインアウトをキャンセルする"
        }
        , goals: {
            onSuccessThenServicePresentsSignInView: "成功した場合_サービスはサインイン画面を表示する"
            , onFailureThenServicePresentsError: "失敗した場合_サービスはエラーを表示する"
            , servicePresentsHomeView: "サービスはホーム画面を表示する"
        }
    }
} as const;