import { Alert, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useThemeStyles } from 'themes/themeStyles';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { UserToken } from './UserToken/UserToken';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { TokenType } from 'interfaces/token';

interface IConfirmUserLink {
    open: boolean;
    closeConfirm: () => void;
    token: string;
    type?: string;
}

export const ConfirmToken = ({
    open,
    closeConfirm,
    token,
    type,
}: IConfirmUserLink) => {
    const { classes: themeStyles } = useThemeStyles();

    return (
        <Dialogue
            open={open}
            onClick={closeConfirm}
            primaryButtonText="Close"
            title="New token created"
        >
            <div className={themeStyles.contentSpacingYLarge}>
                <Typography variant="body1">
                    Your new token has been created successfully.
                </Typography>
                <UserToken token={token} />
            </div>
            <ConditionallyRender
                condition={type === TokenType.FRONTEND}
                show={
                    <Alert sx={{ mt: 2 }} severity="info">
                        By default, all {TokenType.FRONTEND} tokens may be used
                        from any CORS origin. If you'd like to configure a
                        strict set of origins, please use the{' '}
                        <Link to="/admin/cors" target="_blank">
                            CORS origins configuration page
                        </Link>
                        .
                    </Alert>
                }
            />
        </Dialogue>
    );
};
