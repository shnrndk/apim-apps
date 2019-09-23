/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core/';
import { withStyles } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';
import Grid from '@material-ui/core/Grid';
import { injectIntl, } from 'react-intl';
import Alert from '../../../Shared/Alert';
import ConfirmDialog from '../../../Shared/ConfirmDialog';
import CommentEdit from './CommentEdit';
import CommentOptions from './CommentOptions';
import API from '../../../../data/api';

const styles = theme => ({
    link: {
        color: theme.palette.getContrastText(theme.palette.background.default),
        cursor: 'pointer',
    },
    commentIcon: {
        color: theme.palette.getContrastText(theme.palette.background.default),
    },
    commentText: {
        color: theme.palette.getContrastText(theme.palette.background.default),
        marginTop: theme.spacing.unig,
        width: '100%',
        whiteSpace: 'pre-wrap',
        overflowWrap: 'break-word',
    },
    root: {
        marginTop: theme.spacing.unit * 2.5,
    },
    contentWrapper: {
        maxWidth: theme.custom.contentAreaWidth,
        paddingLeft: theme.spacing.unit * 2,
        paddingTop: theme.spacing.unig,
    },
});

/**
 * Display a particular comment and details
 * @class CommentReply
 * @extends {React.Component}
 */
class CommentReply extends React.Component {
    /**
     * Creates an instance of Comment
     * @param {*} props properies passed by the parent element
     * @memberof CommentReply
     */
    constructor(props) {
        super(props);
        this.state = {
            openDialog: false,
            editIndex: -1,
            deleteComment: null,
        };
        this.handleClickDeleteComment = this.handleClickDeleteComment.bind(this);
        this.handleShowEdit = this.handleShowEdit.bind(this);
        this.handleClickOpen = this.handleClickOpen.bind(this);
        this.showEditComment = this.showEditComment.bind(this);
        this.handleConfirmDialog = this.handleConfirmDialog.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.filterRemainingComments = this.filterRemainingComments.bind(this);
        this.filterCommentToDelete = this.filterCommentToDelete.bind(this);
    }

    /**
     * Filters the comments to be remained
     * @memberof CommentReply
     */
    filterRemainingComments(commentToFilter) {
        const { deleteComment } = this.state;
        return commentToFilter.commentId !== deleteComment.commentId;
    }

    /**
     * Filters the comments to be deleted
     * @memberof CommentReply
     */
    filterCommentToDelete(commentToFilter) {
        const { deleteComment } = this.state;
        return commentToFilter.commentId === deleteComment.parentCommentId;
    }

    /**
     * Shows the component to edit a comment
     * @param {any} index Index of comment in the array
     * @memberof CommentReply
     */
    showEditComment(index) {
        const { editIndex } = this.state;
        if (editIndex === -1) {
            this.setState({ editIndex: index });
        }
    }

    /**
     * Hides the component to edit a comment
     * @param {any} index Index of comment in the array
     * @memberof CommentReply
     */
    handleShowEdit() {
        this.setState({ editIndex: -1 });
    }

    /**
     * Shows the confimation dialog to delete a comment
     * @param {Object} comment Comment that has to be deleted
     * @memberof CommentReply
     */
    handleClickOpen(comment) {
        const { editIndex } = this.state;
        if (editIndex === -1) {
            this.setState({ deleteComment: comment, openDialog: true });
        }
    }

    /**
     * Hides the confimation dialog to delete a comment
     * @memberof CommentReply
     */
    handleClose() {
        this.setState({ openDialog: false });
    }

    /**
     * Handles the Confirm Dialog
     * @param {*} bool properies passed by the Confirm Dialog
     * @memberof CommentReply
     */
    handleConfirmDialog(message) {
        if (message) {
            this.handleClickDeleteComment();
        } else {
            this.handleClose();
        }
    }

    /**
     * Handles deleting a comment
     * @memberof CommentReply
     */
    handleClickDeleteComment() {
        const Api = new API();
        const { deleteComment } = this.state;
        const {
            apiId, allComments, commentsUpdate, intl,
        } = this.props;
        const commentIdOfCommentToDelete = deleteComment.commentId;
        const parentCommentIdOfCommentToDelete = deleteComment.parentCommentId;
        this.handleClose();

        Api.deleteComment(apiId, commentIdOfCommentToDelete)
            .then((result) => {
                if (parentCommentIdOfCommentToDelete === undefined) {
                    const remainingComments = allComments.filter(this.filterRemainingComments);
                    commentsUpdate(remainingComments);
                } else {
                    const index = allComments.findIndex(this.filterCommentToDelete);
                    const remainingReplies = allComments[index].replies.filter(this.filterRemainingComments);
                    allComments[index].replies = remainingReplies;
                    commentsUpdate(allComments);
                }
            })
            .catch((error) => {
                console.error(error);
                if (error.response) {
                    Alert.error(error.response.body.message);
                } else {
                    Alert.error(
                        intl.formatMessage({
                            defaultMessage: 'Something went wrong while deleting comment',
                            id: 'Apis.Details.Comments.CommentReply.something.went.wrong',
                        })
                            + ' - '
                            + commentIdOfCommentToDelete,
                    );
                }
            });
    }

    /**
     * Render method of the component
     * @returns {React.Component} Comment html component
     * @memberof CommentReply
     */
    render() {
        const {
            classes, comments, apiId, allComments, commentsUpdate, intl,
        } = this.props;
        const { editIndex, openDialog } = this.state;
        return [
            comments
                && comments.map((comment, index) => (
                    <div key={comment.commentId + '-' + index} className={classes.contentWrapper}>
                        <Grid container spacing={1} className={classes.root}>
                            <Grid item>
                                <Icon className={classes.commentIcon}>account_box</Icon>
                            </Grid>
                            <Grid item xs zeroMinWidth>
                                <Typography noWrap className={classes.commentText} variant='body1'>
                                    {comment.createdBy}
                                </Typography>

                                {index !== editIndex && (
                                    <Typography className={classes.commentText}>{comment.commentText}</Typography>
                                )}

                                {editIndex === index && null}

                                {index === editIndex && (
                                    <CommentEdit
                                        apiId={apiId}
                                        allComments={allComments}
                                        commentsUpdate={commentsUpdate}
                                        comment={comment}
                                        toggleShowEdit={this.handleShowEdit}
                                    />
                                )}
                                <CommentOptions
                                    classes={classes}
                                    comment={comment}
                                    editIndex={editIndex}
                                    index={index}
                                    showAddComment={this.showAddComment}
                                    handleClickOpen={this.handleClickOpen}
                                    showEditComment={this.showEditComment}
                                />
                            </Grid>
                        </Grid>
                    </div>
                )),
            <ConfirmDialog
                key='key-dialog'
                labelCancel='Cancel'
                title='Confirm Delete'
                message={intl.formatMessage({
                    defaultMessage: 'Are you sure you want to delete this comment?',
                    id: 'Apis.Details.Comments.CommentReply.are.you.sure',
                })}
                labelOk='Yes'
                callback={this.handleConfirmDialog}
                open={openDialog}
            />,
        ];
    }
}

CommentReply.defaultProps = {
    api: null,
};

CommentReply.propTypes = {
    classes: PropTypes.instanceOf(Object).isRequired,
    apiId: PropTypes.string.isRequired,
    allComments: PropTypes.instanceOf(Array).isRequired,
    commentsUpdate: PropTypes.func.isRequired,
    comments: PropTypes.instanceOf(Array).isRequired,
    intl: PropTypes.shape({
        formatMessage: PropTypes.func,
    }).isRequired,
};

export default injectIntl(withStyles(styles)(CommentReply));
