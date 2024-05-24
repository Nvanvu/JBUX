const PostModel = require('./post');

const _post = async (req, res) => {
    const { _id } = req.user;
    const {
        dob,
        gender,
        languages,
        certifications,
        summary,
        workExperience,
        skill,
        job,
        image,
        CV
    } = req.body;
    await PostModel.create({
        createdBy: _id,
        hidden: true,
        dob,
        gender,
        languages,
        certifications,
        summary,
        workExperience,
        skill,
        job,
        image,
        CV
    });
    res.send({ success: 1, message: 'Access successful' });
}

const _update_post = async (req, res) => {
    const { _id } = req.params;
    const {
        dob,
        gender,
        languages,
        certifications,
        summary,
        workExperience,
        skill,
        job,
        image,
        CV } = req.body;
    const data_ = await PostModel.findByIdAndUpdate(_id, {
        dob,
        gender,
        languages,
        certifications,
        summary,
        workExperience,
        skill,
        job,
        image,
        CV
    }, { new: true });
    res.send({ success: true, message: 'Update successful.', data: data_ });
}
const _get_post = async (req, res) => {
    const { _id } = req.params;
    const Post = await PostModel.findById(_id);

    if (Post.delete_) {
        return res.send({ success: true, message: 'This post deleted.' });
    }
    if (Post.hidden) {
        return res.send({ success: true, message: 'This post hidden' });
    }
    res.send({ success: true, message: 'Access successful.', data: Post });
}

const _get_posts = async(req, res) = {

}
module.exports = {
    _post,
    _update_post,
    _get_post
}