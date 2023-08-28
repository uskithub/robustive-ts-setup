export default {
    signIn : {
        menu : "Sign In"
        , title : "Sign In"
        , buttons: {
            signIn: "Sign In"
        }
    }
    , signUp : {
        menu : "Sign Up"
        , title : "Sign Up"
        , buttons: {
            signUp: "Sign Up"
        }
    }
    , signOut : {
        menu : "Sign Out"
        , title : "Sign Out"
        , buttons: {
            signOut: "Sign Out"
        }
    }
    , common : {
        labels : {
            mailAddress: "Mail Address"
            , password: "Password"
        }
        , validations : {
            isRequired: (what: string) => `${ what } is required`
            , isMalformed: (what: string) => `${ what } must be valid`
            , isTooShort: (what: string, minLength: number) => `${ what } is too short. It should be equal to or greater than ${minLength} characters.`
            , isTooLong: (what: string, maxLength: number) => `${ what } is too long. It should be equal to or less than ${maxLength} characters.`
        }
    }
};