$(document).ready(function(){
    if($('[data-toggle="tooltip"]').length){
        $('[data-toggle="tooltip"]').tooltip();
    }
    // if($('.ig_datatable').length){
    //     $('.ig_datatable').DataTable();    
    // }
    if($('.ig_select').length){
        $('.ig_select').select2();
    }
    
    /* menu toggle start */
    $('.ig_nav_toggle_inner').on('click', function(){
        $('body').toggleClass('nav_open');
    });
    /* menu toggle end */

    /* add element on table */
        $(document).on('click touchstart','.el_add_element', function(){
        var el = $(this).data('el');
        if(el == 'heading'){
            var el_html = '<tr><td class="el_element heading" data-element="heading" align="center" style="padding: 5px; padding-inline: 10px;color: #222222; font-size: 18px;"><p style="margin:0" contenteditable="true">Welcome to the email editor</p></td></tr>';
            $('.el_target_wrapper').append(el_html);
        }
        if(el == 'paragraph'){
            var el_html = '<tr><td class="el_element paragraph" data-element="paragraph" align="center" style="padding: 5px; padding-inline: 10px;font-size: 14px;"><p style="margin:0" contenteditable="true">React implements a browser-independent DOM system for performance and cross-browser compatibility.</p></td></tr>';
            $('.el_target_wrapper').append(el_html);
        }
        if(el == 'link'){
            var el_html = '<tr><td class="el_element link" data-element="link" align="center" style="padding: 5px; padding-inline: 10px; font-size: 14px;"><a class="link" contenteditable="true" style="cursor: pointer;" href="">https://google.com</a></td></tr>';
            $('.el_target_wrapper').append(el_html);
        }
        if(el == 'button'){
            var el_html = '<tr><td class="el_element" align="center" style="padding: 5px; padding-inline: 10px;"><a class="button" contenteditable="true" data-element="button" style="font-size: 14px; padding:10px 20px; background-color: #4a148c; color: #ffffff; display: inline-block; border-radius: 3px;text-decoration: none;" target="_blank">Button Text</a></td></tr>';
            $('.el_target_wrapper').append(el_html);
        }
        // if(el == 'image'){
        //     var el_html = '<tr><td class="el_element" data-element="paragraph" align="center" style="padding: 10px;"><img src="assets/images/logo.png" alt="" /></td></tr>';
        //     $('.el_target_wrapper').append(el_html);
        // }
        if(el == 'divider'){
            var el_html = '<tr><td class="el_element" data-element="divider" align="center" style="padding: 5px; padding-inline: 10px;"><hr/></td></tr>';
            $('.el_target_wrapper').append(el_html);
        }
    });

    $(document).on('click','.el_element', function(){
        $('.editor_el_actions').remove();
        var el_html = `<span class="editor_el_actions" contenteditable="false">
            <span class="editor_el_actions_inner">
                <span class="eela_btn alignleft" data-toggle="tooltip" title="Align Left"><i class="fa fa-align-left"></i></span>
                <span class="eela_btn aligncenter" data-toggle="tooltip" title="Align Center"><i class="fa fa-align-center"></i></span>
                <span class="eela_btn alignright" data-toggle="tooltip" title="Align Right"><i class="fa fa-align-right"></i></span>
                <span class="eela_btn remove_element" data-toggle="tooltip" title="Remove"><i class="fa fa-times"></i></span>
            </span>
        </span>`;
        $('.eela_btn[data-toggle="tooltip"]').tooltip();

        if($(this).children('.editor_el_actions').length == 0){
            $(this).append(el_html);
        }
    });
    $(document).mouseup(function(e){
        var container = $(".editor_el_actions");
        // if the target of the click isn't the container nor a descendant of the container
        if (!container.is(e.target) && container.has(e.target).length === 0){
            container.remove();
        }
    });

    /* remove element start */
    
    $(document).on('click','.remove_element', function(){
        $(this).parent().closest('td').remove();
    });
    $(document).on('click','.alignleft', function(){
        $(this).parent().closest('td').attr('align','left');
    });
    $(document).on('click','.aligncenter', function(){
        $(this).parent().closest('td').attr('align','center');
    });
    $(document).on('click','.alignright', function(){
        $(this).parent().closest('td').attr('align','right');
    });
    /* remove element end */

    /* datetime picker start */
    if($('.ig_datetimepicker').length){
        $('.ig_datetimepicker').datetimepicker();
    }
    /* datetime picker end */

    /* create group popup start */
    $('.ig_create_group_popup_link').on('click', function(){
        $('#create_contact_popup').modal('toggle');
        $('#create_group_popup').modal();
    });
    $('.ig_create_group_popup_cancel').on('click', function(){
        $('#create_group_popup').modal('toggle');
        $('#create_contact_popup').modal();
    });
    /* create group popup end */

    
});