import { useNavigate } from 'react-router';
import useProject from 'hooks/api/getters/useProject/useProject';
import useLoading from 'hooks/useLoading';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useStyles } from './Project.styles';
import { styled, Tab, Tabs } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import useToast from 'hooks/useToast';
import useQueryParams from 'hooks/useQueryParams';
import React, { useEffect, useMemo, useState } from 'react';
import { ProjectAccess } from '../ProjectAccess/ProjectAccess';
import ProjectEnvironment from '../ProjectEnvironment/ProjectEnvironment';
import { ProjectFeaturesArchive } from './ProjectFeaturesArchive/ProjectFeaturesArchive';
import ProjectOverview from './ProjectOverview';
import ProjectHealth from './ProjectHealth/ProjectHealth';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import {
    DELETE_PROJECT,
    UPDATE_PROJECT,
} from 'component/providers/AccessProvider/permissions';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { Routes, Route, useLocation } from 'react-router-dom';
import { DeleteProjectDialogue } from './DeleteProject/DeleteProjectDialogue';
import { ProjectLog } from './ProjectLog/ProjectLog';
import { ChangeRequestOverview } from 'component/changeRequest/ChangeRequestOverview/ChangeRequestOverview';
import { DraftBanner } from 'component/changeRequest/DraftBanner/DraftBanner';
import { MainLayout } from 'component/layout/MainLayout/MainLayout';
import { ProjectChangeRequests } from '../../changeRequest/ProjectChangeRequests/ProjectChangeRequests';
import { ProjectSettings } from './ProjectSettings/ProjectSettings';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { FavoriteIconButton } from '../../common/FavoriteIconButton/FavoriteIconButton';
import { useFavoriteProjectsApi } from '../../../hooks/api/actions/useFavoriteProjectsApi/useFavoriteProjectsApi';

const StyledDiv = styled('div')(() => ({
    display: 'flex',
}));

const StyledName = styled('div')(({ theme }) => ({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    paddingBottom: theme.spacing(2),
}));

const StyledTitle = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    fontWeight: 'normal',
}));
const StyledText = styled(StyledTitle)(({ theme }) => ({
    color: theme.palette.grey[800],
}));

const Project = () => {
    const projectId = useRequiredPathParam('projectId');
    const params = useQueryParams();
    const { project, loading, refetch } = useProject(projectId);
    const ref = useLoading(loading);
    const { setToastData } = useToast();
    const { classes: styles } = useStyles();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { isOss, uiConfig } = useUiConfig();
    const basePath = `/projects/${projectId}`;
    const projectName = project?.name || projectId;
    const { isChangeRequestConfiguredInAnyEnv, isChangeRequestFlagEnabled } =
        useChangeRequestsEnabled(projectId);
    const { favorite, unfavorite } = useFavoriteProjectsApi();

    const [showDelDialog, setShowDelDialog] = useState(false);

    const tabs = useMemo(() => {
        const tabArray = [
            {
                title: 'Overview',
                path: basePath,
                name: 'overview',
            },
            {
                title: 'Health',
                path: `${basePath}/health`,
                name: 'health',
            },
            ...(!isChangeRequestFlagEnabled
                ? [
                      {
                          title: 'Access',
                          path: `${basePath}/access`,
                          name: 'access',
                      },
                      {
                          title: 'Environments',
                          path: `${basePath}/environments`,
                          name: 'environments',
                      },
                  ]
                : []),
            {
                title: 'Archive',
                path: `${basePath}/archive`,
                name: 'archive',
            },
            ...(isChangeRequestFlagEnabled
                ? [
                      {
                          title: 'Project settings',
                          path: `${basePath}/settings`,
                          name: 'settings',
                      },
                  ]
                : []),
            {
                title: 'Event log',
                path: `${basePath}/logs`,
                name: 'logs',
            },
        ];

        const changeRequestTab = {
            title: 'Change requests',
            path: `${basePath}/change-requests`,
            name: 'change-request',
        };

        if (isChangeRequestFlagEnabled) {
            tabArray.splice(tabArray.length - 2, 0, changeRequestTab);
        }
        return tabArray;
    }, [isChangeRequestFlagEnabled]);

    const activeTab = [...tabs]
        .reverse()
        .find(tab => pathname.startsWith(tab.path));

    useEffect(() => {
        const created = params.get('created');
        const edited = params.get('edited');

        if (created || edited) {
            const text = created ? 'Project created' : 'Project updated';
            setToastData({
                type: 'success',
                title: text,
            });
        }

        /* eslint-disable-next-line */
    }, []);

    const onFavorite = async () => {
        if (project?.favorite) {
            await unfavorite(projectId);
        } else {
            await favorite(projectId);
        }
        refetch();
    };

    return (
        <MainLayout
            ref={ref}
            subheader={
                isChangeRequestConfiguredInAnyEnv() ? (
                    <DraftBanner project={projectId} />
                ) : null
            }
        >
            <div className={styles.header}>
                <div className={styles.innerContainer}>
                    <ConditionallyRender
                        condition={Boolean(uiConfig?.flags?.favorites)}
                        show={() => (
                            <FavoriteIconButton
                                onClick={onFavorite}
                                isFavorite={project?.favorite}
                            />
                        )}
                    />
                    <h2 className={styles.title}>
                        <div>
                            <StyledName data-loading>{projectName}</StyledName>
                            <ConditionallyRender
                                condition={Boolean(project.description)}
                                show={
                                    <StyledDiv>
                                        <StyledTitle data-loading>
                                            Description:&nbsp;
                                        </StyledTitle>
                                        <StyledText data-loading>
                                            {project.description}
                                        </StyledText>
                                    </StyledDiv>
                                }
                            />
                            <StyledDiv>
                                <StyledTitle data-loading>
                                    projectId:&nbsp;
                                </StyledTitle>
                                <StyledText data-loading>
                                    {projectId}
                                </StyledText>
                            </StyledDiv>
                        </div>
                        <StyledDiv>
                            <PermissionIconButton
                                permission={UPDATE_PROJECT}
                                projectId={projectId}
                                sx={{
                                    visibility: isOss() ? 'hidden' : 'visible',
                                }}
                                onClick={() =>
                                    navigate(`/projects/${projectId}/edit`)
                                }
                                tooltipProps={{ title: 'Edit project' }}
                                data-loading
                            >
                                <Edit />
                            </PermissionIconButton>
                            <PermissionIconButton
                                permission={DELETE_PROJECT}
                                projectId={projectId}
                                sx={{
                                    visibility: isOss() ? 'hidden' : 'visible',
                                }}
                                onClick={() => {
                                    setShowDelDialog(true);
                                }}
                                tooltipProps={{ title: 'Delete project' }}
                                data-loading
                            >
                                <Delete />
                            </PermissionIconButton>
                        </StyledDiv>
                    </h2>
                </div>

                <div className={styles.separator} />
                <div className={styles.tabContainer}>
                    <Tabs
                        value={activeTab?.path}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="scrollable"
                    >
                        {tabs.map(tab => (
                            <Tab
                                key={tab.title}
                                label={tab.title}
                                value={tab.path}
                                onClick={() => navigate(tab.path)}
                                className={styles.tabButton}
                            />
                        ))}
                    </Tabs>
                </div>
            </div>
            <DeleteProjectDialogue
                project={projectId}
                open={showDelDialog}
                onClose={() => {
                    setShowDelDialog(false);
                }}
                onSuccess={() => {
                    navigate('/projects');
                }}
            />
            <Routes>
                <Route path="health" element={<ProjectHealth />} />
                <Route path="access/*" element={<ProjectAccess />} />
                <Route path="environments" element={<ProjectEnvironment />} />
                <Route path="archive" element={<ProjectFeaturesArchive />} />
                <Route path="logs" element={<ProjectLog />} />
                <Route
                    path="change-requests"
                    element={
                        <ConditionallyRender
                            condition={isChangeRequestFlagEnabled}
                            show={<ProjectChangeRequests />}
                        />
                    }
                />
                <Route
                    path="change-requests/:id"
                    element={
                        <ConditionallyRender
                            condition={isChangeRequestFlagEnabled}
                            show={<ChangeRequestOverview />}
                        />
                    }
                />
                <Route path="settings/*" element={<ProjectSettings />} />
                <Route path="*" element={<ProjectOverview />} />
            </Routes>
        </MainLayout>
    );
};

export default Project;
